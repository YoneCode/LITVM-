// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldFarm
 * @notice Single-sided staking with per-user reward accrual (MasterChef pattern).
 *         Users stake `stakeToken` and continuously earn `rewardToken` at a fixed
 *         emission rate, split pro-rata by stake. Rewards are CLAIMABLE BY THE USER —
 *         this is the fix for the previous design, where vault rewards accrued to the
 *         vault contract and could never reach depositors.
 *
 * @dev Reward math: a global `accRewardPerShare` accumulator (scaled by PRECISION).
 *      A user's owed rewards = stake * accRewardPerShare / PRECISION - rewardDebt.
 *      The contract must be funded with `rewardToken` to pay out; payouts are capped
 *      at the available reward balance so a shortfall degrades gracefully instead of
 *      reverting. Withdrawals of principal are always honoured.
 *
 *      Safe for the same-token case (stakeToken == rewardToken, e.g. VRT staked to
 *      earn VRT): reward payouts never dip into staked principal, because the
 *      available reward balance excludes `totalStaked` when the tokens are identical.
 *
 *      Assumes standard (non-fee-on-transfer, non-rebasing) ERC-20 tokens, which
 *      WzkLTC and VRT both are.
 */
contract YieldFarm is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    uint256 private constant PRECISION = 1e18;

    IERC20 public immutable stakeToken;
    IERC20 public immutable rewardToken;
    bool public immutable sameToken;

    /// @notice reward tokens emitted per second, shared across all stakers.
    uint256 public rewardRate;

    uint256 public accRewardPerShare; // scaled by PRECISION
    uint256 public lastRewardTime;
    uint256 public totalStaked;
    uint256 public totalRewardsClaimed;

    struct UserInfo {
        uint256 amount; // staked principal
        uint256 rewardDebt; // accounting checkpoint
    }
    mapping(address => UserInfo) public userInfo;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event RewardsFunded(address indexed from, uint256 amount);
    event TokenRecovered(address indexed token, uint256 amount);

    /**
     * @param _stakeToken  token users deposit (e.g. WzkLTC)
     * @param _rewardToken token users earn (e.g. VRT)
     * @param _rewardRate  reward tokens emitted per second (total)
     * @param initialOwner contract owner
     */
    constructor(
        address _stakeToken,
        address _rewardToken,
        uint256 _rewardRate,
        address initialOwner
    ) {
        require(_stakeToken != address(0), "stake=0");
        require(_rewardToken != address(0), "reward=0");
        require(initialOwner != address(0), "owner=0");
        _transferOwnership(initialOwner);

        stakeToken = IERC20(_stakeToken);
        rewardToken = IERC20(_rewardToken);
        sameToken = _stakeToken == _rewardToken;
        rewardRate = _rewardRate;
        lastRewardTime = block.timestamp;
    }

    /* --------------------------------------------------------------------- */
    /*                              VIEWS                                    */
    /* --------------------------------------------------------------------- */

    /// @notice Reward tokens available to pay out (excludes staked principal when tokens match).
    function rewardsAvailable() public view returns (uint256) {
        uint256 bal = rewardToken.balanceOf(address(this));
        if (sameToken) {
            return bal > totalStaked ? bal - totalStaked : 0;
        }
        return bal;
    }

    /// @notice Rewards currently claimable by `user`, including unrealized accrual.
    function pendingRewards(address user) public view returns (uint256) {
        UserInfo storage u = userInfo[user];
        uint256 acc = accRewardPerShare;
        if (block.timestamp > lastRewardTime && totalStaked > 0) {
            uint256 elapsed = block.timestamp - lastRewardTime;
            acc += (elapsed * rewardRate * PRECISION) / totalStaked;
        }
        if (u.amount == 0) return 0;
        uint256 gross = (u.amount * acc) / PRECISION;
        if (gross <= u.rewardDebt) return 0;
        return gross - u.rewardDebt;
    }

    /// @notice Alias matching common staking UIs.
    function earned(address user) external view returns (uint256) {
        return pendingRewards(user);
    }

    /// @notice Staked balance of `user`.
    function balanceOf(address user) external view returns (uint256) {
        return userInfo[user].amount;
    }

    /// @notice Convenience: reward tokens emitted per day at the current rate.
    function rewardPerDay() external view returns (uint256) {
        return rewardRate * 1 days;
    }

    /* --------------------------------------------------------------------- */
    /*                          USER ACTIONS                                 */
    /* --------------------------------------------------------------------- */

    /// @notice Stake `amount` of stakeToken. Auto-claims any pending rewards first.
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "amount=0");
        _updatePool();

        UserInfo storage u = userInfo[msg.sender];
        uint256 pending = _settledPending(u);

        // effects
        u.amount += amount;
        totalStaked += amount;
        u.rewardDebt = (u.amount * accRewardPerShare) / PRECISION;

        // interactions
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);
        if (pending > 0) _payReward(msg.sender, pending);

        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw `amount` of staked principal. Auto-claims pending rewards.
    ///         Allowed even while paused so users can always exit.
    function withdraw(uint256 amount) external nonReentrant {
        UserInfo storage u = userInfo[msg.sender];
        require(amount > 0, "amount=0");
        require(u.amount >= amount, "insufficient stake");
        _updatePool();

        uint256 pending = _settledPending(u);

        // effects
        u.amount -= amount;
        totalStaked -= amount;
        u.rewardDebt = (u.amount * accRewardPerShare) / PRECISION;

        // interactions
        stakeToken.safeTransfer(msg.sender, amount);
        if (pending > 0) _payReward(msg.sender, pending);

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim pending rewards without touching principal.
    function claim() external nonReentrant {
        _updatePool();
        UserInfo storage u = userInfo[msg.sender];
        uint256 pending = _settledPending(u);
        require(pending > 0, "nothing to claim");
        u.rewardDebt = (u.amount * accRewardPerShare) / PRECISION;
        _payReward(msg.sender, pending);
    }

    /// @notice Withdraw all principal immediately, forfeiting unclaimed rewards.
    ///         Escape hatch that never depends on reward solvency.
    function emergencyWithdraw() external nonReentrant {
        UserInfo storage u = userInfo[msg.sender];
        uint256 amount = u.amount;
        require(amount > 0, "nothing staked");

        u.amount = 0;
        u.rewardDebt = 0;
        totalStaked -= amount;

        stakeToken.safeTransfer(msg.sender, amount);
        emit EmergencyWithdrawn(msg.sender, amount);
    }

    /* --------------------------------------------------------------------- */
    /*                           ADMIN                                       */
    /* --------------------------------------------------------------------- */

    /// @notice Update the emission rate. Settles the pool first so past rewards are unaffected.
    function setRewardRate(uint256 newRate) external onlyOwner {
        _updatePool();
        uint256 old = rewardRate;
        rewardRate = newRate;
        emit RewardRateUpdated(old, newRate);
    }

    /// @notice Fund the contract with reward tokens (pull from caller).
    function fundRewards(uint256 amount) external {
        require(amount > 0, "amount=0");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Recover tokens accidentally sent here. Cannot touch the stake or reward token,
    ///         so user principal and the reward pool are never at risk.
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(stakeToken), "no stake token");
        require(token != address(rewardToken), "no reward token");
        IERC20(token).safeTransfer(owner(), amount);
        emit TokenRecovered(token, amount);
    }

    /* --------------------------------------------------------------------- */
    /*                          INTERNAL                                     */
    /* --------------------------------------------------------------------- */

    function _updatePool() internal {
        if (block.timestamp <= lastRewardTime) return;
        if (totalStaked == 0) {
            // no stakers — advance the clock so rewards don't accrue retroactively
            lastRewardTime = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - lastRewardTime;
        accRewardPerShare += (elapsed * rewardRate * PRECISION) / totalStaked;
        lastRewardTime = block.timestamp;
    }

    /// @dev Pending rewards owed to `u` given the (already-updated) accumulator.
    function _settledPending(UserInfo storage u) internal view returns (uint256) {
        if (u.amount == 0) return 0;
        uint256 gross = (u.amount * accRewardPerShare) / PRECISION;
        if (gross <= u.rewardDebt) return 0;
        return gross - u.rewardDebt;
    }

    /// @dev Transfer up to `amount` of rewards, capped at the available reward balance.
    function _payReward(address to, uint256 amount) internal {
        uint256 avail = rewardsAvailable();
        uint256 send = amount > avail ? avail : amount;
        if (send > 0) {
            totalRewardsClaimed += send;
            rewardToken.safeTransfer(to, send);
            emit RewardPaid(to, send);
        }
    }
}

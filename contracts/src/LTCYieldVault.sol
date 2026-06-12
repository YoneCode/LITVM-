// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LTCYieldVault
 * @notice An ERC-4626 tokenized vault for WzkLTC that ALSO distributes a separate
 *         reward token (VRT) to share-holders, pro-rata and per second, on a
 *         reward-per-share index. Deposit WzkLTC, receive standard 4626 shares,
 *         earn claimable VRT.
 *
 * @dev This is the corrected design. The earlier vault accrued rewards to the vault
 *      contract and could never pay depositors; here rewards are tracked per holder
 *      and are claimable directly.
 *
 *      Accounting (MasterChef-style, on the share token):
 *        - `accRewardPerShare` (scaled by ACC) grows by `elapsed * rewardRate / totalSupply`.
 *        - A holder is owed `balanceOf * accRewardPerShare / ACC - rewardDebt`, plus any
 *          already-settled `rewards[holder]`.
 *        - Rewards are settled on every share movement (mint on deposit, burn on withdraw,
 *          and transfers) via the ERC-20 before/after hooks, so transferring shares moves
 *          only FUTURE rewards — past rewards stay with the sender.
 *      Every action is O(1) regardless of holder count.
 *
 *      The reward token MUST differ from the asset, so `totalAssets()` (= asset balance)
 *      is never polluted by the reward pool.
 */
contract LTCYieldVault is ERC4626, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    uint256 private constant ACC = 1e18;

    IERC20 public immutable rewardToken; // VRT
    uint256 public rewardRate; // reward tokens emitted per second (total)
    uint256 public accRewardPerShare; // scaled by ACC
    uint256 public lastUpdate;
    uint256 public totalRewardsClaimed;

    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public rewards; // settled, claimable

    event RewardPaid(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event RewardsFunded(address indexed from, uint256 amount);
    event TokenRecovered(address indexed token, uint256 amount);

    constructor(
        IERC20 asset_,
        address rewardToken_,
        uint256 rewardRate_,
        address initialOwner
    ) ERC20("LitVM LTC Yield Vault", "lyvWzkLTC") ERC4626(asset_) {
        require(rewardToken_ != address(0), "reward=0");
        require(initialOwner != address(0), "owner=0");
        require(rewardToken_ != address(asset_), "asset==reward");
        _transferOwnership(initialOwner);
        rewardToken = IERC20(rewardToken_);
        rewardRate = rewardRate_;
        lastUpdate = block.timestamp;
    }

    /* ----------------------------- views ----------------------------- */

    /// @notice VRT available to pay out (asset != reward, so this is the full reward balance).
    function rewardsAvailable() public view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    /// @notice VRT/day emitted across all shares at the current rate.
    function rewardPerDay() external view returns (uint256) {
        return rewardRate * 1 days;
    }

    /// @notice Claimable VRT for `account`, including unrealized accrual.
    function earned(address account) public view returns (uint256) {
        uint256 acc = accRewardPerShare;
        uint256 supply = totalSupply();
        if (block.timestamp > lastUpdate && supply > 0) {
            acc += ((block.timestamp - lastUpdate) * rewardRate * ACC) / supply;
        }
        uint256 accumulated = (balanceOf(account) * acc) / ACC;
        uint256 pending = accumulated > rewardDebt[account] ? accumulated - rewardDebt[account] : 0;
        return rewards[account] + pending;
    }

    /* ----------------------------- user actions ----------------------------- */

    /// @notice Claim accrued VRT without touching the vault position.
    function claim() external nonReentrant {
        _updatePool();
        _settle(msg.sender);
        rewardDebt[msg.sender] = (balanceOf(msg.sender) * accRewardPerShare) / ACC;
        uint256 amt = rewards[msg.sender];
        require(amt > 0, "nothing to claim");
        rewards[msg.sender] = 0;
        _payReward(msg.sender, amt);
    }

    // ERC-4626 entrypoints: deposits gated by pause; withdrawals always allowed.
    function deposit(uint256 assets, address receiver) public override whenNotPaused nonReentrant returns (uint256) {
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver) public override whenNotPaused nonReentrant returns (uint256) {
        return super.mint(shares, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner_) public override nonReentrant returns (uint256) {
        return super.withdraw(assets, receiver, owner_);
    }

    function redeem(uint256 shares, address receiver, address owner_) public override nonReentrant returns (uint256) {
        return super.redeem(shares, receiver, owner_);
    }

    /* ----------------------------- admin ----------------------------- */

    function setRewardRate(uint256 newRate) external onlyOwner {
        _updatePool();
        uint256 old = rewardRate;
        rewardRate = newRate;
        emit RewardRateUpdated(old, newRate);
    }

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

    /// @notice Recover stray tokens. Cannot touch the vault asset (WzkLTC) or the reward token.
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != asset(), "no asset token");
        require(token != address(rewardToken), "no reward token");
        IERC20(token).safeTransfer(owner(), amount);
        emit TokenRecovered(token, amount);
    }

    /* ----------------------------- internal: reward engine ----------------------------- */

    function _updatePool() internal {
        if (block.timestamp <= lastUpdate) return;
        uint256 supply = totalSupply();
        if (supply == 0) {
            lastUpdate = block.timestamp;
            return;
        }
        accRewardPerShare += ((block.timestamp - lastUpdate) * rewardRate * ACC) / supply;
        lastUpdate = block.timestamp;
    }

    /// @dev Move a holder's pending (on current balance) into the settled `rewards[]` bucket.
    ///      Does not re-base rewardDebt; callers re-base after any balance change.
    function _settle(address a) internal {
        uint256 accumulated = (balanceOf(a) * accRewardPerShare) / ACC;
        if (accumulated > rewardDebt[a]) {
            rewards[a] += accumulated - rewardDebt[a];
        }
    }

    function _payReward(address to, uint256 amt) internal {
        uint256 bal = rewardToken.balanceOf(address(this));
        uint256 send = amt > bal ? bal : amt;
        if (send > 0) {
            totalRewardsClaimed += send;
            rewardToken.safeTransfer(to, send);
            emit RewardPaid(to, send);
        }
    }

    // Settle rewards for both parties BEFORE balances move (mint: from=0, burn: to=0, transfer: both).
    function _beforeTokenTransfer(address from, address to, uint256) internal override {
        _updatePool();
        if (from != address(0)) _settle(from);
        if (to != address(0)) _settle(to);
    }

    // Re-base reward debt to the NEW balances after they've moved.
    function _afterTokenTransfer(address from, address to, uint256) internal override {
        if (from != address(0)) rewardDebt[from] = (balanceOf(from) * accRewardPerShare) / ACC;
        if (to != address(0)) rewardDebt[to] = (balanceOf(to) * accRewardPerShare) / ACC;
    }
}

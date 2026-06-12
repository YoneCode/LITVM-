// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFaucet is ReentrancyGuard, Ownable {
    IERC20 public token;
    uint256 public constant CLAIM_AMOUNT = 10 * 10**18;
    uint256 public constant COOLDOWN = 24 hours;

    mapping(address => uint256) public lastClaim;

    event Claimed(address indexed user, uint256 amount);
    event Refilled(uint256 amount);
    event Drained(uint256 amount);

    constructor(address _token, address initialOwner) {
        require(_token != address(0), "Invalid token");
        _transferOwnership(initialOwner);
        token = IERC20(_token);
    }

    function claim() external nonReentrant {
        require(block.timestamp >= lastClaim[msg.sender] + COOLDOWN, "Wait 24h");
        require(token.balanceOf(address(this)) >= CLAIM_AMOUNT, "Empty");

        lastClaim[msg.sender] = block.timestamp;
        require(token.transfer(msg.sender, CLAIM_AMOUNT), "Transfer failed");

        emit Claimed(msg.sender, CLAIM_AMOUNT);
    }

    function emergencyDrain() external onlyOwner {
        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "Empty");
        require(token.transfer(owner(), bal), "Drain failed");
        emit Drained(bal);
    }

    function refill(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Refill failed");
        emit Refilled(amount);
    }

    function timeUntilClaim(address user) external view returns (uint256) {
        uint256 next = lastClaim[user] + COOLDOWN;
        if (block.timestamp >= next) return 0;
        return next - block.timestamp;
    }
}

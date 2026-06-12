// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultRewardToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("VaultRewardToken", "VRT") {
        _transferOwnership(initialOwner);
        _mint(initialOwner, 100_000_000 * 10**decimals());
    }
}

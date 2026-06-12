// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/LTCYieldVault.sol";

contract MockERC20 is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) {}
    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}

contract LTCYieldVaultTest is Test {
    MockERC20 asset_; // WzkLTC
    MockERC20 reward; // VRT
    LTCYieldVault vault;

    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant RATE = 1e18; // 1 VRT / sec
    uint256 constant FUND = 1_000_000e18;

    function setUp() public {
        asset_ = new MockERC20("Wrapped zkLTC", "WzkLTC");
        reward = new MockERC20("Vault Reward Token", "VRT");

        vm.prank(owner);
        vault = new LTCYieldVault(asset_, address(reward), RATE, owner);

        reward.mint(address(vault), FUND);

        asset_.mint(alice, 1_000e18);
        asset_.mint(bob, 1_000e18);
        vm.prank(alice);
        asset_.approve(address(vault), type(uint256).max);
        vm.prank(bob);
        asset_.approve(address(vault), type(uint256).max);
    }

    /* ----------------------------- ERC-4626 surface ----------------------------- */

    function testDepositMintsSharesOneToOne() public {
        vm.prank(alice);
        uint256 shares = vault.deposit(100e18, alice);
        assertEq(shares, 100e18, "shares");
        assertEq(vault.balanceOf(alice), 100e18, "balance");
        assertEq(vault.totalAssets(), 100e18, "totalAssets");
        assertEq(vault.convertToAssets(100e18), 100e18, "convertToAssets");
        assertEq(vault.maxWithdraw(alice), 100e18, "maxWithdraw");
    }

    function testRedeemReturnsAssets() public {
        vm.startPrank(alice);
        vault.deposit(100e18, alice);
        uint256 before = asset_.balanceOf(alice);
        uint256 assets = vault.redeem(40e18, alice, alice);
        vm.stopPrank();
        assertEq(assets, 40e18, "assets out");
        assertEq(asset_.balanceOf(alice) - before, 40e18, "asset returned");
        assertEq(vault.balanceOf(alice), 60e18, "remaining shares");
    }

    function testWithdrawByAssets() public {
        vm.startPrank(alice);
        vault.deposit(100e18, alice);
        vault.withdraw(30e18, alice, alice);
        vm.stopPrank();
        assertEq(vault.balanceOf(alice), 70e18);
        assertEq(vault.totalAssets(), 70e18);
    }

    /* ----------------------------- VRT rewards reach users ----------------------------- */

    function testSingleHolderEarnsExactAndClaims() public {
        vm.prank(alice);
        vault.deposit(100e18, alice);

        skip(100);
        uint256 expected = RATE * 100; // sole holder gets full emission
        assertEq(vault.earned(alice), expected, "earned");

        uint256 before = reward.balanceOf(alice);
        vm.prank(alice);
        vault.claim();
        assertEq(reward.balanceOf(alice) - before, expected, "claim payout");
        assertEq(vault.earned(alice), 0, "earned reset");
        assertEq(vault.totalRewardsClaimed(), expected);
    }

    function testTwoHoldersSplitProportionally() public {
        vm.prank(alice);
        vault.deposit(100e18, alice); // 25%
        vm.prank(bob);
        vault.deposit(300e18, bob); // 75%

        skip(100);
        uint256 total = RATE * 100;
        assertApproxEqAbs(vault.earned(alice), total / 4, 1e6, "alice 25%");
        assertApproxEqAbs(vault.earned(bob), (total * 3) / 4, 1e6, "bob 75%");
    }

    function testShareTransferMovesOnlyFutureRewards() public {
        vm.prank(alice);
        vault.deposit(100e18, alice);
        skip(100); // alice earns 100e18 as sole holder

        // alice sends half her shares to bob
        vm.prank(alice);
        vault.transfer(bob, 50e18);

        skip(100); // now 50/50 split of the next 100e18

        // alice keeps her settled 100e18 + half of the new 100e18
        assertEq(vault.earned(alice), 100e18 + 50e18, "alice past + future/2");
        assertEq(vault.earned(bob), 50e18, "bob only future/2");
    }

    function testWithdrawKeepsAccruedRewardsClaimable() public {
        vm.prank(alice);
        vault.deposit(100e18, alice);
        skip(100);

        vm.prank(alice);
        vault.redeem(100e18, alice, alice); // full exit of principal

        assertEq(vault.balanceOf(alice), 0, "no shares");
        assertEq(asset_.balanceOf(alice), 1_000e18, "principal back");
        // rewards earned before exit are still claimable
        assertEq(vault.earned(alice), RATE * 100, "rewards retained");

        uint256 before = reward.balanceOf(alice);
        vm.prank(alice);
        vault.claim();
        assertEq(reward.balanceOf(alice) - before, RATE * 100, "claim after exit");
    }

    /* ----------------------------- safety ----------------------------- */

    function testPayoutCappedWhenUnderfunded() public {
        LTCYieldVault poor = new LTCYieldVault(asset_, address(reward), RATE, owner);
        reward.mint(address(poor), 10e18); // only 10 VRT
        asset_.mint(alice, 100e18);
        vm.startPrank(alice);
        asset_.approve(address(poor), type(uint256).max);
        poor.deposit(100e18, alice);
        vm.stopPrank();

        skip(100); // owes 100e18, only 10e18 available
        uint256 before = reward.balanceOf(alice);
        vm.prank(alice);
        poor.claim(); // must not revert
        assertEq(reward.balanceOf(alice) - before, 10e18, "paid only available");
    }

    function testPauseBlocksDepositAllowsWithdraw() public {
        vm.prank(alice);
        vault.deposit(100e18, alice);

        vm.prank(owner);
        vault.pause();

        vm.prank(bob);
        vm.expectRevert(bytes("Pausable: paused"));
        vault.deposit(10e18, bob);

        skip(50);
        vm.prank(alice);
        vault.redeem(100e18, alice, alice); // exit still works while paused
        assertEq(vault.balanceOf(alice), 0);
    }

    function testClaimRevertsWhenNothing() public {
        vm.prank(alice);
        vm.expectRevert(bytes("nothing to claim"));
        vault.claim();
    }

    function testOnlyOwnerAdmin() public {
        vm.startPrank(alice);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        vault.setRewardRate(5);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        vault.pause();
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        vault.recoverToken(address(reward), 1);
        vm.stopPrank();
    }

    function testRecoverTokenProtectsAssetAndReward() public {
        vm.startPrank(owner);
        vm.expectRevert(bytes("no asset token"));
        vault.recoverToken(address(asset_), 1);
        vm.expectRevert(bytes("no reward token"));
        vault.recoverToken(address(reward), 1);
        vm.stopPrank();

        MockERC20 stray = new MockERC20("Stray", "STR");
        stray.mint(address(vault), 5e18);
        vm.prank(owner);
        vault.recoverToken(address(stray), 5e18);
        assertEq(stray.balanceOf(owner), 5e18);
    }

    function testConstructorRejectsSameToken() public {
        vm.expectRevert(bytes("asset==reward"));
        new LTCYieldVault(reward, address(reward), RATE, owner);
    }

    function testSetRewardRateSettlesFirst() public {
        vm.prank(alice);
        vault.deposit(100e18, alice);
        skip(100);
        vm.prank(owner);
        vault.setRewardRate(2e18);
        assertEq(vault.earned(alice), RATE * 100, "pre-change preserved");
        skip(100);
        assertEq(vault.earned(alice), RATE * 100 + 2e18 * 100, "new rate after");
    }

    function testNoRewardsWhileEmpty() public {
        skip(1000); // nobody deposited
        vm.prank(alice);
        vault.deposit(100e18, alice);
        assertEq(vault.earned(alice), 0, "no retroactive rewards");
        skip(50);
        assertEq(vault.earned(alice), RATE * 50, "earns from deposit time");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/YieldFarm.sol";

contract MockERC20 is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) {}
    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}

contract YieldFarmTest is Test {
    MockERC20 stake; // stand-in for WzkLTC
    MockERC20 reward; // stand-in for VRT
    YieldFarm farm;

    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant RATE = 1e18; // 1 reward token / second
    uint256 constant FUND = 1_000_000e18;

    function setUp() public {
        stake = new MockERC20("Wrapped zkLTC", "WzkLTC");
        reward = new MockERC20("Vault Reward Token", "VRT");

        vm.prank(owner);
        farm = new YieldFarm(address(stake), address(reward), RATE, owner);

        // fund the farm so it can pay rewards
        reward.mint(address(farm), FUND);

        // give users stake tokens
        stake.mint(alice, 1_000e18);
        stake.mint(bob, 1_000e18);

        vm.prank(alice);
        stake.approve(address(farm), type(uint256).max);
        vm.prank(bob);
        stake.approve(address(farm), type(uint256).max);
    }

    /* ----------------------- core: yield reaches users ----------------------- */

    function testSingleUserEarnsExactAndClaims() public {
        vm.prank(alice);
        farm.stake(100e18);

        skip(100); // 100 seconds

        // single staker earns the full emission: RATE * elapsed
        uint256 expected = RATE * 100;
        assertEq(farm.pendingRewards(alice), expected, "pending mismatch");

        uint256 before = reward.balanceOf(alice);
        vm.prank(alice);
        farm.claim();
        assertEq(reward.balanceOf(alice) - before, expected, "claim payout mismatch");
        assertEq(farm.pendingRewards(alice), 0, "pending not reset");
        assertEq(farm.totalRewardsClaimed(), expected);
    }

    function testTwoUsersSplitProportionally() public {
        vm.prank(alice);
        farm.stake(100e18); // 25%
        vm.prank(bob);
        farm.stake(300e18); // 75%

        skip(100);

        uint256 total = RATE * 100;
        assertApproxEqAbs(farm.pendingRewards(alice), total / 4, 1e6, "alice ~25%");
        assertApproxEqAbs(farm.pendingRewards(bob), (total * 3) / 4, 1e6, "bob ~75%");
    }

    function testNoRewardsAccrueWhileEmpty() public {
        // 1000s pass with nobody staked
        skip(1000);
        vm.prank(alice);
        farm.stake(100e18);
        // immediately after staking, nothing earned yet
        assertEq(farm.pendingRewards(alice), 0, "should not earn for empty period");
        skip(50);
        assertEq(farm.pendingRewards(alice), RATE * 50, "earns only from stake time");
    }

    function testWithdrawReturnsPrincipalAndPaysRewards() public {
        vm.prank(alice);
        farm.stake(100e18);
        skip(100);

        uint256 stakeBefore = stake.balanceOf(alice);
        uint256 rewardBefore = reward.balanceOf(alice);

        vm.prank(alice);
        farm.withdraw(40e18);

        assertEq(stake.balanceOf(alice) - stakeBefore, 40e18, "principal returned");
        assertEq(reward.balanceOf(alice) - rewardBefore, RATE * 100, "rewards auto-claimed");
        assertEq(farm.balanceOf(alice), 60e18, "remaining stake");
    }

    /* ----------------------- safety properties ----------------------- */

    function testPayoutCappedWhenUnderfunded() public {
        // drain the farm to a tiny reward balance
        vm.prank(owner);
        // recoverToken can't touch reward token, so simulate underfunding with a fresh farm
        YieldFarm poor = new YieldFarm(address(stake), address(reward), RATE, owner);
        reward.mint(address(poor), 10e18); // only 10 reward tokens
        stake.mint(alice, 100e18);
        vm.startPrank(alice);
        stake.approve(address(poor), type(uint256).max);
        poor.stake(100e18);
        vm.stopPrank();

        skip(100); // accrues 100e18 owed, but only 10e18 available

        uint256 before = reward.balanceOf(alice);
        vm.prank(alice);
        poor.claim(); // must NOT revert
        assertEq(reward.balanceOf(alice) - before, 10e18, "paid only what was available");
    }

    function testPauseBlocksStakeButAllowsExit() public {
        vm.prank(alice);
        farm.stake(100e18);

        vm.prank(owner);
        farm.pause();

        vm.prank(bob);
        vm.expectRevert(bytes("Pausable: paused"));
        farm.stake(10e18);

        // withdraw still works while paused
        skip(50);
        vm.prank(alice);
        farm.withdraw(100e18);
        assertEq(farm.balanceOf(alice), 0);
    }

    function testEmergencyWithdrawForfeitsRewards() public {
        vm.prank(alice);
        farm.stake(100e18);
        skip(100);

        uint256 rewardBefore = reward.balanceOf(alice);
        vm.prank(alice);
        farm.emergencyWithdraw();

        assertEq(farm.balanceOf(alice), 0, "principal cleared");
        assertEq(stake.balanceOf(alice), 1_000e18, "principal fully returned");
        assertEq(reward.balanceOf(alice), rewardBefore, "no rewards paid");
        assertEq(farm.pendingRewards(alice), 0);
    }

    function testClaimRevertsWhenNothing() public {
        vm.prank(alice);
        vm.expectRevert(bytes("nothing to claim"));
        farm.claim();
    }

    function testOnlyOwnerAdmin() public {
        vm.startPrank(alice);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        farm.setRewardRate(5);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        farm.pause();
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        farm.recoverToken(address(reward), 1);
        vm.stopPrank();
    }

    function testRecoverTokenProtectsStakeAndReward() public {
        vm.startPrank(owner);
        vm.expectRevert(bytes("no stake token"));
        farm.recoverToken(address(stake), 1);
        vm.expectRevert(bytes("no reward token"));
        farm.recoverToken(address(reward), 1);
        vm.stopPrank();

        // an unrelated token can be recovered
        MockERC20 stray = new MockERC20("Stray", "STR");
        stray.mint(address(farm), 5e18);
        vm.prank(owner);
        farm.recoverToken(address(stray), 5e18);
        assertEq(stray.balanceOf(owner), 5e18);
    }

    function testSetRewardRateSettlesFirst() public {
        vm.prank(alice);
        farm.stake(100e18);
        skip(100); // 100e18 owed at old rate

        vm.prank(owner);
        farm.setRewardRate(2e18); // change rate

        // the 100s before the change are unaffected
        assertEq(farm.pendingRewards(alice), RATE * 100, "pre-change rewards preserved");
        skip(100);
        // now earns at new rate for the next 100s
        assertEq(farm.pendingRewards(alice), RATE * 100 + 2e18 * 100, "new rate applied after");
    }

    /* ----------------------- same-token (VRT staked to earn VRT) ----------------------- */

    function testSameTokenStakingNeverPaysPrincipalAsReward() public {
        // stakeToken == rewardToken
        YieldFarm vrtFarm = new YieldFarm(address(reward), address(reward), RATE, owner);
        // fund rewards on top of what will be staked
        reward.mint(address(vrtFarm), FUND);
        reward.mint(alice, 100e18);

        vm.startPrank(alice);
        reward.approve(address(vrtFarm), type(uint256).max);
        vrtFarm.stake(100e18);
        vm.stopPrank();

        // rewardsAvailable must exclude the staked principal
        assertEq(vrtFarm.rewardsAvailable(), FUND, "available excludes principal");

        skip(100);
        vm.prank(alice);
        vrtFarm.claim();

        // alice can still withdraw her full principal afterwards
        vm.prank(alice);
        vrtFarm.withdraw(100e18);
        assertEq(vrtFarm.balanceOf(alice), 0);
        // she has principal (100) + rewards (100) back
        assertEq(reward.balanceOf(alice), 200e18, "principal + rewards intact");
    }
}

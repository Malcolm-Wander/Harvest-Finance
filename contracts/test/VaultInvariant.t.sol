// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import "../src/Vault.sol";
import "../src/MockERC20.sol";

/**
 * @title VaultInvariantTest
 * @dev Invariant/property-based tests for Vault
 * These tests verify that certain properties always hold true
 * regardless of the sequence of operations
 */
contract VaultHandler {
    Vault public immutable vault;
    MockERC20 public immutable token;

    address[] public actors;

    constructor(Vault _vault, MockERC20 _token, address[] memory _actors) {
        vault = _vault;
        token = _token;
        actors = _actors;
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function deposit(uint256 seed, uint256 assets) external {
        address actor = _actor(seed);

        // Keep amounts realistic for fuzzing + avoid exhausting balances
        assets = bound(assets, 1, 1e24);

        vm.startPrank(actor);
        token.approve(address(vault), type(uint256).max);
        // ignore reverts (invariant profile has fail_on_revert=false)
        try vault.deposit(assets, actor) { } catch { }
        vm.stopPrank();
    }

    function withdraw(uint256 seed, uint256 assets) external {
        address actor = _actor(seed);
        assets = bound(assets, 1, 1e24);

        vm.startPrank(actor);
        try vault.withdraw(assets, actor, actor) { } catch { }
        vm.stopPrank();
    }

    function redeem(uint256 seed, uint256 shares) external {
        address actor = _actor(seed);
        shares = bound(shares, 1, 1e24);

        vm.startPrank(actor);
        try vault.redeem(shares, actor, actor) { } catch { }
        vm.stopPrank();
    }
}

contract VaultInvariantTest is StdInvariant, Test {
    Vault public vault;
    MockERC20 public token;
    VaultHandler public handler;

    address public user1 = address(0x1111);
    address public user2 = address(0x2222);
    address public user3 = address(0x3333);

    function setUp() public {
        token = new MockERC20("Test Token", "TEST", type(uint128).max);
        vault = new Vault(token, "Vault Token", "vTEST");

        // Fund actors with ample tokens
        token.mint(user1, 1e27);
        token.mint(user2, 1e27);
        token.mint(user3, 1e27);

        address[] memory actors = new address[](3);
        actors[0] = user1;
        actors[1] = user2;
        actors[2] = user3;

        handler = new VaultHandler(vault, token, actors);

        // Drive random sequences through the handler only
        targetContract(address(handler));
    }

    /**
     * @dev Invariant: Vault's tracked assets should never exceed actual token balance.
     * (Allows for "donations" sent directly to the vault, which increase balance without updating accounting.)
     */
    function invariant_TotalAssetsNeverExceedBalance() public view {
        assertLe(vault.totalAssets(), token.balanceOf(address(vault)), "totalAssets exceeds actual balance");
    }

    /**
     * @dev Invariant: Total shares represent claims on assets; converting all shares should
     * never exceed totalAssets (modulo small rounding).
     *
     * Example: convertToAssets(totalSupply) <= totalAssets + 1
     */
    function invariant_TotalShareClaimsBoundedByAssets() public view {
        uint256 supply = vault.totalSupply();
        if (supply == 0) return;

        uint256 claim = vault.convertToAssets(supply);
        assertLe(claim, vault.totalAssets() + 1, "share claims exceed assets");
    }

    /**
     * @dev Invariant: conversion sanity — converting assets->shares->assets should not increase value.
     * This helps prevent a "free money" rounding cycle.
     */
    function invariant_NoProfitFromRoundTripConversion() public view {
        uint256 assets = 1e18;
        uint256 shares = vault.convertToShares(assets);
        uint256 assetsBack = vault.convertToAssets(shares);
        assertLe(assetsBack, assets, "round trip increased assets");
    }
}

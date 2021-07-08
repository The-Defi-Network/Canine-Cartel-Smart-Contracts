// SPDX-License-Identifier: UNLICENSED
// Created by The Defi Network LLC
// Copyright 2021.

pragma solidity ^0.8.4;

/* 
 * @title ICanineCartel Non Fungible Token Sale Contract Interface
 * @dev See https://docs.openzeppelin.com/contracts/3.x/erc721
*/
interface ICanineCartel {
    //
    // MAIN FUNCTIONS
    //

    /*
     * @notice Buy NFTs from the contract
     * @param _count The number of NFTs bought
    */
    function buy(uint256 _count) external payable;

    //
    // SETTERS
    //

    /**
     * @notice Sets the price of each NFT
     * @param _price The price passed in 
    */
    function setPrice(uint256 _price) external;

    /**
     * @notice Sets the address of owner's payout wallet
     * @param _ownerAddress The owner's payout wallet address
    */
    function setOwnerAddress(address payable _ownerAddress) external;

    /**
     * @notice Sets the address of dev's payout wallet
     * @param _devAddress The dev's payout wallet address
    */
    function setDevAddress(address payable _devAddress) external;

    /**
     * @notice Sets the address of marketing team's payout wallet
     * @param _marketingAddress The marketing team's payout wallet address
    */
    function setMarketingAddress(address payable _marketingAddress) external;

    //
    // VIEW FUNCTIONS
    //

    /**
     * @notice Price of each NFT
     * @return uint256 The price
    */
    function price() external returns(uint256);

    /**
     * @notice The total NFTs minted
     * @return uint256 The total
    */
    function totalSupply() external returns(uint256);

    /**
     * @notice The owner's payout wallet address
     * @return address payable The address
    */
    function ownerAddress() external returns(address payable);

    /**
     * @notice The dev's payout wallet address
     * @return address payable The address
    */
    function devAddress() external returns(address payable);

    /**
     * @notice The marketing team's payout wallet address
     * @return address payable The address
    */
    function marketingAddress() external returns(address payable);
}

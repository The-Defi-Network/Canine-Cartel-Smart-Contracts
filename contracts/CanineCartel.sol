// SPDX-License-Identifier: UNLICENSED
// Created by The Defi Network LLC
// Copyright 2021.

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import './ICanineCartel.sol';

contract CanineCartel is ICanineCartel, ERC721, Ownable {
    using SafeMath for uint256;

    uint256 public override price = 0.08 ether;
    uint256 public override totalSupply = 0;

    address payable public override ownerAddress;
    address payable public override devAddress;
    address payable public override marketingAddress;

    uint256 private ownerPercent = 68;
    uint256 private devPercent = 30;
    uint256 private marketingPercent = 2;

    constructor(
        address payable _ownerAddress, 
        address payable _devAddress,
        address payable _marketingAddress
    ) ERC721("NFT", "Random NFT Sale") {
        ownerAddress = _ownerAddress;
        devAddress = _devAddress;
        marketingAddress = _marketingAddress;
    }

    receive() external payable {}

    function buy(uint256 _count) external payable override {
        // Make sure only 10000 NFTs can exist
        require(
            totalSupply <= 10000,
            "MFTSale::buy: All NFT's are minted"
        );
        // Make sure buyer is paying right price
        require(
            msg.value == price.mul(_count), 
            "NFTSale::buy: Wrong amount of ETH sent "
        );

        for (uint256 i = 0; i < _count; i++) {
            totalSupply = totalSupply.add(1);
            _safeMint(msg.sender, totalSupply);
        }

        uint256 ownerShare = price.mul(_count).mul(70).div(100);
        uint256 devShare = price.mul(_count).mul(30).div(100);

        ownerAddress.transfer(ownerShare);
        devAddress.transfer(devShare);
    }

    function setPrice(uint256 _price) external override onlyOwner {
        price = _price;
    }

    function setOwnerAddress(address payable _ownerAddress) external override onlyOwner {
        ownerAddress = _ownerAddress;
    }

    function setDevAddress(address payable _devAddress) external override onlyOwner {
        devAddress = _devAddress;
    }

    function setMarketingAddress(address payable _marketingAddress) external override onlyOwner {
        marketingAddress = _marketingAddress;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://www.google.com/";
    }
}

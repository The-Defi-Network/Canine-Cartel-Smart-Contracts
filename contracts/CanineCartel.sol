// SPDX-License-Identifier: None
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CanineCartel is Ownable, ERC721 {
    using SafeMath for uint256;

    uint256 public mintPrice = 80000000000000000;
    uint256 public mintLimit = 20;

    uint256 public supplyLimit;
    bool public saleActive = false;

    constructor(
        uint256 tokenSupplyLimit,
        string memory tokenBaseUri
    ) ERC721("CanineCartel", "MONSTER") {
        supplyLimit = tokenSupplyLimit;
        _setBaseURI(tokenBaseUri);
    }

    function toggleSaleActive() external onlyOwner {
        saleActive = !saleActive;
    }

    function changeSupplyLimit(uint256 _supplyLimit) external onlyOwner {
        supplyLimit = _supplyLimit;
    }

    function changeMintLimit(uint256 _mintLimit) external onlyOwner {
        mintLimit = _mintLimit;
    }

    function changeMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function buyCanines(uint numberOfTokens) external payable {
        require(saleActive, "Sale is not active.");
        require(numberOfTokens <= mintLimit, "Too many tokens for one transaction.");
        require(msg.value >= mintPrice.mul(numberOfTokens), "Insufficient payment.");

        _mintCanines(numberOfTokens);
    }

    function _mintCanines(uint numberOfTokens) private {
        require(totalSupply().add(numberOfTokens) <= supplyLimit, "Not enough tokens left.");

        uint256 newId = totalSupply();
        for(uint i = 0; i < numberOfTokens; i++) {
            newId += 1;
            _safeMint(msg.sender, newId);
        }
    }

    function reserveCanines(uint256 numberOfTokens) external onlyOwner {
        _mintCanines(numberOfTokens);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setBaseURI(newBaseURI);
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw.");
        
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdrawal failed.");
    }

    function tokensOwnedBy(address wallet) external view returns(uint256[] memory) {
      uint tokenCount = balanceOf(wallet);

      uint256[] memory ownedTokenIds = new uint256[](tokenCount);
      for(uint i = 0; i < tokenCount; i++){
        ownedTokenIds[i] = tokenOfOwnerByIndex(wallet, i);
      }

      return ownedTokenIds;
    }
}
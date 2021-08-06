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

    address public wallet1Address;
    address public wallet2Address;
    address public wallet3Address;

    uint8 public wallet1Share = 34;
    uint8 public wallet2Share = 51;
    uint8 public wallet3Share = 15;

    /********* Events - Start *********/
    event wallet1AddressChanged(address _wallet1);
    event wallet2AddressChanged(address _wallet2);
    event wallet3AddressChanged(address _wallet3);

    event wallet1ShareChanged(uint8 _value);
    event wallet2ShareChanged(uint8 _value);
    event wallet3ShareChanged(uint8 _value);

    event SaleStateChanged(bool _state);
    event SupplyLimitChanged(uint256 _supplyLimit);
    event MintLimitChanged(uint256 _mintLimit);
    event MintPriceChanged(uint256 _mintPrice);
    event CanineMinted(address indexed _user, uint256 indexed _tokenId, string _baseURI);
    event ReserveCanines(uint256 _numberOfTokens);

    event TokenURISet(uint256 _tokenId, string _tokenURI);
    /********* Events - Ends *********/

    constructor(
        uint256 tokenSupplyLimit,
        string memory tokenBaseUri
    ) ERC721("CanineCartel", "CC") {
        supplyLimit = tokenSupplyLimit;
        _setBaseURI(tokenBaseUri);
        wallet1Address = owner();
        wallet2Address = owner();
        wallet3Address = owner();

        emit SupplyLimitChanged(supplyLimit);
        emit MintLimitChanged(mintLimit);
        emit MintPriceChanged(mintPrice);
        emit wallet1ShareChanged(wallet1Share);
        emit wallet2ShareChanged(wallet2Share);
        emit wallet3ShareChanged(wallet3Share);
    }

    function setWallet_1(address _address) external onlyOwner{
        wallet1Address = _address;
        emit wallet1AddressChanged(_address);
    }

    function setWallet_2(address _address) external onlyOwner{
        wallet2Address = _address;
        transferOwnership(_address);
        emit wallet2AddressChanged(_address);
    }

    function setWallet_3(address _address) external onlyOwner{
        wallet3Address = _address;
        emit wallet3AddressChanged(_address);
    }

    function changeWallet_1_Share(uint8 _value) external onlyOwner{
        wallet1Share = _value;
        emit wallet1ShareChanged(_value);
    }

    function changeWallet_2_Share(uint8 _value) external onlyOwner{
        wallet2Share = _value;
        emit wallet2ShareChanged(_value);
    }

    function changeWallet_3_Share(uint8 _value) external onlyOwner{
        wallet3Share = _value;
        emit wallet3ShareChanged(_value);
    }

    function toggleSaleActive() external onlyOwner {
        saleActive = !saleActive;
        emit SaleStateChanged(saleActive);
    }
 

    function changeSupplyLimit(uint256 _supplyLimit) external onlyOwner {
        require(_supplyLimit >= totalSupply(), "Value should be greater currently minted canines.");
        supplyLimit = _supplyLimit;
        emit SupplyLimitChanged(_supplyLimit);
    }

    function changeMintLimit(uint256 _mintLimit) external onlyOwner {
        mintLimit = _mintLimit;
        emit MintLimitChanged(_mintLimit);
    }

    function changeMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
        emit MintPriceChanged(_mintPrice);
    }

    function buyCanines(uint _numberOfTokens) external payable {
        require(saleActive, "Sale is not active.");
        require(_numberOfTokens <= mintLimit, "Too many tokens for one transaction.");
        require(msg.value >= mintPrice.mul(_numberOfTokens), "Insufficient payment.");

        _mintCanines(_numberOfTokens);
        _withdraw(msg.value);
    }

    function _mintCanines(uint _numberOfTokens) private {
        require(totalSupply().add(_numberOfTokens) <= supplyLimit, "Not enough tokens left.");

        uint256 newId = totalSupply();
        for(uint i = 0; i < _numberOfTokens; i++) {
            newId += 1;
            _safeMint(msg.sender, newId);
            emit CanineMinted(msg.sender, newId, baseURI());
        }
    }

    function reserveCanines(uint256 _numberOfTokens) external onlyOwner {
        _mintCanines(_numberOfTokens);
        emit ReserveCanines(_numberOfTokens);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setBaseURI(newBaseURI);
    }

    function _withdraw(uint256 _amount) internal {
        require(address(this).balance > 0, "No balance to withdraw.");

        (bool wallet1Success, ) = wallet1Address.call{value: _amount.mul(wallet1Share).div(100)}("");
        (bool wallet2Success, ) = wallet2Address.call{value: _amount.mul(wallet2Share).div(100)}("");
        (bool wallet3Success, ) = wallet3Address.call{value: _amount.mul(wallet3Share).div(100)}("");
        
        require(wallet1Success && wallet2Success && wallet3Success, "Withdrawal failed.");
    }

    function tokensOwnedBy(address wallet) external view returns(uint256[] memory) {
      uint tokenCount = balanceOf(wallet);

      uint256[] memory ownedTokenIds = new uint256[](tokenCount);
      for(uint i = 0; i < tokenCount; i++){
        ownedTokenIds[i] = tokenOfOwnerByIndex(wallet, i);
      }

      return ownedTokenIds;
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI) public onlyOwner{
        _setTokenURI(_tokenId, _tokenURI);
        emit TokenURISet(_tokenId, _tokenURI);
    }
}
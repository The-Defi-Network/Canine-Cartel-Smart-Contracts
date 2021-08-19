// SPDX-License-Identifier: None
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CanineCartel is Ownable, ERC721 {
    using SafeMath for uint256;

    uint256 public mintPrice = 0.05 ether;
    uint256 public mintLimit = 20;

    uint256 public supplyLimit;
    bool public saleActive = false;

    address public wallet1Address;
    address public wallet2Address;
    address public wallet3Address;

    uint8 public wallet1Share = 33;
    uint8 public wallet2Share = 50;
    uint8 public wallet3Share = 17;

    mapping(uint256 => string) styles;

    /********* Events - Start *********/
    event wallet1AddressChanged(address _wallet1);
    event wallet2AddressChanged(address _wallet2);
    event wallet3AddressChanged(address _wallet3);

    event SharesChanged(uint8 _value1, uint8 _value2, uint8 _value3);

    event SaleStateChanged(bool _state);
    event SupplyLimitChanged(uint256 _supplyLimit);
    event MintLimitChanged(uint256 _mintLimit);
    event MintPriceChanged(uint256 _mintPrice);
    event BaseURIChanged(string _baseURI);
    event CanineMinted(address indexed _user, uint256 indexed _tokenId, string _tokenURI);
    event ReserveCanines(uint256 _numberOfTokens);

    event TokenURISet(uint256 _tokenId, string _tokenURI);
    event NameChanged(uint256 _tokenId, string _name);
    event StyleAdded(uint256 _id, string _URI);
    event StyleRemoved(uint256 _id, string _URI);
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
        emit SharesChanged(wallet1Share, wallet2Share, wallet3Share);
        emit BaseURIChanged(tokenBaseUri);
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

    function changeWalletShares(uint8 _value1, uint8 _value2, uint8 _value3) external onlyOwner{
        require(_value1 + _value2 + _value3 == 100, "Shares are not adding up to 100.");
        wallet1Share = _value1;
        wallet2Share = _value2;
        wallet3Share = _value3;
        emit SharesChanged(_value1, _value2, _value3);
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
    }

    function _mintCanines(uint _numberOfTokens) private {
        require(totalSupply().add(_numberOfTokens) <= supplyLimit, "Not enough tokens left.");

        uint256 newId = totalSupply();
        for(uint i = 0; i < _numberOfTokens; i++) {
            newId += 1;
            _safeMint(msg.sender, newId);
            emit CanineMinted(msg.sender, newId, tokenURI(newId));
        }
    }

    function reserveCanines(uint256 _numberOfTokens) external onlyOwner {
        _mintCanines(_numberOfTokens);
        emit ReserveCanines(_numberOfTokens);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setBaseURI(newBaseURI);
        emit BaseURIChanged(newBaseURI);
    }

    /*
        thio function will send contract balance to its share holders
        according to their shares.
    */
    function _withdraw() internal {
        require(address(this).balance > 0, "No balance to withdraw.");
        uint256 _amount = address(this).balance;
        (bool wallet1Success, ) = wallet1Address.call{value: _amount.mul(wallet1Share).div(100)}("");
        (bool wallet2Success, ) = wallet2Address.call{value: _amount.mul(wallet2Share).div(100)}("");
        (bool wallet3Success, ) = wallet3Address.call{value: _amount.mul(wallet3Share).div(100)}("");
        
        require(wallet1Success && wallet2Success && wallet3Success, "Withdrawal failed.");
    }

    /*
        This function is used to set Token uri
        param _id: style number
        param _tokenId: tokenId
    */
    function setTokenURI(uint256 _id, uint256 _tokenId) public{
        require(ownerOf(_tokenId) == msg.sender, "Only owner of NFT can change name.");
        require(_exists(_tokenId), "NFT dosen't exists.");
        bytes memory URI = abi.encodePacked(styles[_id], uint2str(_tokenId));
        _setTokenURI(_tokenId, string(URI));
        emit TokenURISet(_tokenId, string(URI));
    }

    /*
        This function is used to set Token uri by owner
        param _tokenId: tokenId
        param _tokenURI: tokenURI
    */
    function ownerSetTokenURI(uint256 _tokenId, string memory _tokenURI) external onlyOwner{
        require(_exists(_tokenId), "NFT dosen't exists.");
        _setTokenURI(_tokenId, _tokenURI);
        emit TokenURISet(_tokenId, _tokenURI);
    }

    /*
        This function is used to add styles
        param _id: style number
        param _URI: string URI
    */
    function addStyle(uint256 _id, string memory _URI)external onlyOwner{
        require(_id > 0, "Invalid style Id.");
        styles[_id] = _URI;
        emit StyleAdded(_id, _URI);
    }

    /*
        This function is used to remove styles
        param _id: style number
    */
    function removeStyle(uint256 _id)external onlyOwner{
        require(_id > 0, "Invalid style Id.");
        emit StyleRemoved(_id, styles[_id]);
        delete styles[_id];
    }

     /*
        This function is used to change NFT name
        param _tokenId: tokenId
        param _name: name
    */
    function nameNFT(uint256 _tokenId, string memory _name) public{
        require(ownerOf(_tokenId) == msg.sender, "Only owner of NFT can change name.");
        emit NameChanged(_tokenId, _name);
    }

    /*
        thio function will send all contract balance to its contract owner.
    */
    function emergancyWithdraw() external onlyOwner{
        require(address(this).balance > 0, "No funds in smart Contract.");
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw Failed.");
    }

    /*
        thio function will call _withdraw() function.
        any of the one shareholder can call this function.
    */
    function withdrawAll() public {
        require(msg.sender == wallet1Address || msg.sender == wallet2Address || msg.sender == wallet3Address, "Only share holders can call this method.");
        _withdraw();
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC721.sol";
import "./interfaces/IERC20.sol";
import "./utils/BlackList.sol";
import "./utils/Ownable.sol";
import "./utils/BasicMetaTransaction.sol";
import "./utils/Context.sol";

contract EConnectNFT is ERC721, Ownable, BlackList, BasicMetaTransaction {
    using Strings for uint256;
    mapping(uint256 => string) private _tokenURIs;

    event Deposit(address indexed from, uint256 indexed tokenId);
    event Withdraw(address indexed to, uint256 indexed tokenId);
    event Mint(address indexed to, uint256 indexed tokenId);

    constructor(string memory name_, string memory symbol_, string memory _baseURI) ERC721(name_, symbol_, _baseURI) {}

    /**
     * creation of a new token by the owner
     */
    function mint(address _to, uint256 _tokenId, string memory _uri) external onlyOwner
    {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _uri);
        emit Mint(_to, _tokenId);
    }

    /**
     * creation of a token by the owner of a contract that was previously transferred to off-chain
     */
    function withdraw(address _to, uint256 _tokenId, string memory _uri) external onlyOwner
    {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _uri);
        emit Withdraw(_to, _tokenId);
    }

    /**
     * burning the token
     */
    function burn(uint256 _tokenId) onlyNotBlocked(_msgSender()) external {
        address _sender = _msgSender();
        require(!getBlackListStatus(_sender));
        require(_isApprovedOrOwner(_sender, _tokenId), "eConnectNFT: caller is not token owner or approved");
        _burn(_tokenId);
    }

    /**
     * burning the token for transferred to off-chain
     */
    function deposit(uint256 _tokenId) onlyNotBlocked(_msgSender()) external {
        address _sender = _msgSender();
        require(!getBlackListStatus(_sender));
        require(_isApprovedOrOwner(_sender, _tokenId), "eConnectNFT: caller is not token owner or approved");
        _burn(_tokenId);

        emit Deposit(_sender, _tokenId);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        _requireMinted(_tokenId);

        string memory _tokenURI = _tokenURIs[_tokenId];
        string memory _base = baseURI;

        if (bytes(_base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(_base, _tokenURI));
        }

        return super.tokenURI(_tokenId);
    }

    /**
     * update baseUri for all tokens
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * update tokenURL for token
     */
    function _setTokenURI(uint256 _tokenId, string memory _tokenURI) internal {
        require(_exists(_tokenId), "eConnectNFT: URI set of nonexistent token");
        _tokenURIs[_tokenId] = _tokenURI;
    }

    function _beforeTokenTransfer(address, address, uint256, uint256) internal virtual override{
        require(!getBlackListStatus(_msgSender()));
    }

    function _msgSender() internal view override(Context, BasicMetaTransaction) returns (address) {
        return BasicMetaTransaction._msgSender();
    }

    /**
     * Token transfer function from the contract address;
     */
    function recoverTokens(address _token, address _to, uint _value) public onlyOwner {
        IERC20(_token).transfer(_to, _value);
    }

    /**
     * BNB transfer function from the contract address;
     */
    function recoverBNB(address payable _to) public onlyOwner {
        (bool sent,) = _to.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable virtual {}
}

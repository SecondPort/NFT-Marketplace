// SPDX-License-Identifier: MIT
pragma solidity >0.4.20;

import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _nftsSold;
    Counters.Counter private _ntfCount;
    uint256 public LISTING_FEE = 0.0001 ether;
    address payable private _marketOwner;
    mapping(uint256 => NFT) private _idToNFT;


    struct NFT {
        address nftsContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool listed;
    }
    event NFTListed(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
        );
    event NFTSold(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
    );

    constructor(){
        _marketOwner = payable(msg.sender);
    }

    //para listar el nft en el market
    function listNft(address _nftContract, uint256 _tokenId, uint256 _price)public payable nonReentrant {
        require(_price > 0, "el precio debe ser mayor a 1");
        require(msg.value == LISTING_FEE, "no tiene suficientes ether para pagar el fee" );

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        NFT storage nft = _idToNFT[_tokenId];
        nft.seller = payable(msg.sender);
        nft.owner = payable(address(this));
        nft.listed = true;
        nft.price = _price;

        _nftsSold.decrement();
        emit NFTListed(_nftContract, _tokenId, msg.sender, address(this), _price);
    }

    function getListingFee()public view returns (uint256){
        return LISTING_FEE;
    }

    function getListedNfts()public view returns (NFT[] memory){
        uint256 nftCount = _ntfCount.current();
        uint256 unsoldNftsCount = nftCount - _nftsSold.current();

        NFT[] memory nfts = new NFT[](unsoldNftsCount);
        uint nftsIndex = 0;
        for(uint i = 0; i < nftCount; i++){
            if(_idToNFT[i + 1].listed){
                nftsIndex++;
            }
        }
        return nfts;
    }
}
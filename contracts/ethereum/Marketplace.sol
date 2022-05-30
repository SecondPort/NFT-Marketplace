// SPDX-License-Identifier: MIT
pragma solidity >0.4.20;

import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";


//Hacemos esto para poder defendernos de los ataques de reingreso: ReentrancyGuard

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _nftsSold; //aumenta cuando se vende un NFT y disminuye cuando se vuelve a cotizar un NFT
    Counters.Counter private _ntfCount; //realiza un seguimiento de cuántos NFT se han enumerado
    uint256 public LISTING_FEE = 0.0001 ether; //se toma del vendedor y se transfiere al
    //propietario del contrato del mercado cada vez que se vende un NFT
    address payable private _marketOwner; //almacena el propietario del contrato de Marketplace
    //para que sepamos a quién pagar la tarifa de cotización
    mapping(uint256 => NFT) private _idToNFT; //asocia el tokenId único a la estructura NFT


    //almacena información relevante para un NFT que cotiza en el mercado
    struct NFT {
        address nftsContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool listed;
    }

    //se emite cada vez que se enumera un NFT
    event NFTListed(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
        );

    //se emite cada vez que se vende un NFT
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

    //se llama cuando un usuario acuña y enumera por primera vez su NFT. Transfiere la propiedad del usuario al contrato de Marketplace
    function listNft(address _nftContract, uint256 _tokenId, uint256 _price)public payable nonReentrant {
        require(_price > 0, "el precio debe ser mayor a 1");
        require(msg.value == LISTING_FEE, "no tiene suficientes ether para pagar el fee");

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        NFT storage nft = _idToNFT[_tokenId];
        nft.seller = payable(msg.sender);
        nft.owner = payable(address(this));
        nft.listed = true;
        nft.price = _price;

        _nftsSold.decrement();
        emit NFTListed(_nftContract, _tokenId, msg.sender, address(this), _price);
    }

    //se llama cuando un usuario compra un NFT. El comprador se convierte en el nuevo propietario del NFT,
    //el token se transfiere del comprador al vendedor y la tarifa de cotización se entrega al propietario del mercado
    function buyNft(address _nftContract, uint256 _tokenId) public payable nonReentrant {
        NFT storage nft = _idToNFT[_tokenId];
        require(msg.value >= nft.price, "Not enough ether to cover asking price");

        address payable buyer = payable(msg.sender);
        payable(nft.seller).transfer(msg.value);
        IERC721(_nftContract).transferFrom(address(this), buyer, nft.tokenId);
        _marketOwner.transfer(LISTING_FEE);
        nft.owner = buyer;
        nft.listed = false;

        _nftsSold.increment();
        emit NFTSold(_nftContract, nft.tokenId, nft.seller, buyer, msg.value);
    }

    //permite a los usuarios vender un NFT que compran en el mercado
    function resellNft(address _nftContract, uint256 _tokenId, uint256 _price) public payable nonReentrant {
        require(_price > 0, "Price must be at least 1 wei");
        require(msg.value == LISTING_FEE, "Not enough ether for listing fee");

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        NFT storage nft = _idToNFT[_tokenId];
        nft.seller = payable(msg.sender);
        nft.owner = payable(address(this));
        nft.listed = true;
        nft.price = _price;

        _nftsSold.decrement();
        emit NFTListed(_nftContract, _tokenId, msg.sender, address(this), _price);
    }

    /*devuelve la tarifa de cotización. Esto es completamente opcional. Cuando implementa un contrato inteligente,
    en realidad se crea una función LISTING_FEE() para usted, pero creamos una función getter para la limpieza del código
    */
    function getListingFee()public view returns (uint256){
        return LISTING_FEE;
    }

    //recupera los NFT que están actualmente listados para la venta.
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

    //recupera los NFT que el usuario ha comprado
    function getMyNfts() public view returns (NFT[] memory) {
    uint nftCount = _nftCount.current();
    uint myNftCount = 0;
    for (uint i = 0; i < nftCount; i++) {
        if (_idToNFT[i + 1].owner == msg.sender) {
            myNftCount++;
        }
    }

    NFT[] memory nfts = new NFT[](myNftCount);
    uint nftsIndex = 0;
    for (uint i = 0; i < nftCount; i++) {
        if (_idToNFT[i + 1].owner == msg.sender) {
                nfts[nftsIndex] = _idToNFT[i + 1];
                nftsIndex++;
            }
        }
        return nfts;
    }

    //recupera los NFT que el usuario ha puesto a la venta
    function getMyListedNfts() public view returns (NFT[] memory) {
    uint nftCount = _nftCount.current();
    uint myListedNftCount = 0;
    for (uint i = 0; i < nftCount; i++) {
        if (_idToNFT[i + 1].seller == msg.sender && _idToNFT[i + 1].listed) {
            myListedNftCount++;
        }
    }

    NFT[] memory nfts = new NFT[](myListedNftCount);
    uint nftsIndex = 0;
    for (uint i = 0; i < nftCount; i++) {
        if (_idToNFT[i + 1].seller == msg.sender && _idToNFT[i + 1].listed) {
                nfts[nftsIndex] = _idToNFT[i + 1];
                nftsIndex++;
            }
        }
        return nfts;
    }
}
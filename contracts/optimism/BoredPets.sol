// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract BoredPetsNFT is ERC721URIStorage {
  using Counters for Counters.Counter;// Counter is a simple counter contract that can be used to count the number of tokens minted.
  Counters.Counter private _tokenIds;
  address marketplaceContract;// address of the marketplace contract
  event NFTMinted(uint256);

  constructor(address _marketplaceContract) ERC721("Bored Pets Yacht Club", "BPYC") {
    marketplaceContract = _marketplaceContract;
  }

  function mint(string memory _tokenURI) public {
    _tokenIds.increment();// increment the tokenIds counter
    uint256 newTokenId = _tokenIds.current();// get the new tokenId
    _safeMint(msg.sender, newTokenId);// safeMint: mint a new token with the given tokenId
    _setTokenURI(newTokenId, _tokenURI);// set the tokenURI for the new token
    setApprovalForAll(marketplaceContract, true);// set the approval for the marketplace contract
    emit NFTMinted(newTokenId);
  }
}

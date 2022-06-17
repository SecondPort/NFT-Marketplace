var BoredPetsNFT = artifacts.require("BoredPetsNFT");
var Marketplace = artifacts.require("Marketplace");
var Web3 = require('web3');

async function logNftLists(marketplace) {
    let listedNfts = await marketplace.getListedNfts.call()
    const accountAddress = '0xC33115E7E64811e634Cb2eA2858962305f4c3FE7'
    let myNfts = await marketplace.getMyNfts.call({ from: accountAddress })
    let myListedNfts = await marketplace.getMyListedNfts.call({ from: accountAddress })
    console.log(`listedNfts: ${listedNfts.length}`)
    console.log(`myNfts: ${myNfts.length}`)
    console.log(`myListedNfts ${myListedNfts.length}\n`)
}

const main = async (cb) => {
    try {
        const boredPets = await BoredPetsNFT.deployed()
        const marketplace = await Marketplace.deployed()

        console.log('MINT AND LIST 3 NFTs')
        let listingFee = await marketplace.getListingFee()
        listingFee = listingFee.toString()
        let txn1 = await boredPets.mint("URI1")
        let tokenId1 = txn1.logs[2].args[0].toNumber()
        await marketplace.listNft(boredPets.address, tokenId1, 1, { value: listingFee })
        console.log(`Minted and listed ${tokenId1}`)
        let txn2 = await boredPets.mint("URI1")
        let tokenId2 = txn2.logs[2].args[0].toNumber()
        await marketplace.listNft(boredPets.address, tokenId2, 1, { value: listingFee })
        console.log(`Minted and listed ${tokenId2}`)
        let txn3 = await boredPets.mint("URI1")
        let tokenId3 = txn3.logs[2].args[0].toNumber()
        await marketplace.listNft(boredPets.address, tokenId3, 1, { value: listingFee })
        console.log(`Minted and listed ${tokenId3}`)
        await logNftLists(marketplace)

        console.log('BUY 2 NFTs')
        await marketplace.buyNft(boredPets.address, tokenId1, { value: 1, })
        await marketplace.buyNft(boredPets.address, tokenId2, { value: 1 })
        await logNftLists(marketplace)

        console.log('RESELL 1 NFT')
        await marketplace.resellNft(boredPets.address, tokenId2, 1, { value: listingFee })
        await logNftLists(marketplace)

    } catch (err) {
        console.log('Doh! ', err);
    }
    cb();
}

module.exports = main;

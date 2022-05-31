var BoredStudent = artifacts.require("BoredStudent");
var Marketplace = artifacts.require("Marketplace");

async function logNftLists(marketplace) {
    let nftsListados = await marketplace.getListedNfts.call()
    const direcc_cuenta = '837dD5a792B650a9470F50452bF5DC8e10519E55';
    let MisNfts = await marketplace.getMyNfts.call({
        from: direcc_cuenta
    })
    let MisNfts_Listados = await marketplace.getMyListedNfts.call({
        from: direcc_cuenta
    })
    console.log(`nftsListados: ${nftsListados.length}`)
    console.log(`MisNfts: ${MisNfts.length}`)
    console.log(`MisNfts_Listados ${MisNfts_Listados.length}\n`)
}

const main = async (cb) => {
    try {
        const boredStudent = await BoredStudent.deployed()
        const marketplace = await Marketplace.deployed()

        console.log('Mint y listado de 3 nfts')
        let fee = await marketplace.getListingFee()
        fee = fee.toString()
        let txn1 = await boredStudent.mint("URI1")
        let tokenId1 = txn1.logs[2].args[0].toNumber()
        await marketplace.listNft(boredStudent.address, tokenId1, 1, {
            value: fee
        })
        console.log(`Minteado y listado ${tokenId1}`)
        let txn2 = await boredStudent.mint("URI1")
        let tokenId2 = txn2.logs[2].args[0].toNumber()
        await marketplace.listNft(boredStudent.address, tokenId2, 1, {
            value: fee
        })
        console.log(`Minteado y listado ${tokenId2}`)
        let txn3 = await boredStudent.mint("URI1")
        let tokenId3 = txn3.logs[2].args[0].toNumber()
        await marketplace.listNft(boredStudent.address, tokenId3, 1, {
            value: fee
        })
        console.log(`Minteado y listado ${tokenId3}`)
        await logNftLists(marketplace)

        console.log('Comprar 2 nfts')
        await marketplace.buyNft(boredStudent.address, tokenId1, {
            value: 1
        })
        await marketplace.buyNft(boredStudent.address, tokenId2, {
            value: 1
        })
        await logNftLists(marketplace)

        console.log('Revender 1 nfts')
        await marketplace.resellNft(boredStudent.address, tokenId2, 1, {
            value: fee
        })
        await logNftLists(marketplace)

    } catch (err) {
        console.log('Shit no anda... ', err);
    }
    cb();
}

module.exports = main;
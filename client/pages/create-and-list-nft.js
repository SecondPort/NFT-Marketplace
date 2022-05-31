import {
    useState
} from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import {
    create as ipfsHttpClient
} from "ipfs-http-client";
import {
    useRouter
} from "next/router";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import Marketplace from "../contracts/ethereum-contracts/Marketplace.json";
import BoredStudent from "../contracts/ethereum-contracts/BoredStudent.json";

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({
        price: "",
        name: "",
        description: "",
    });
    const router = useRouter();

    async function onChange(e) {
        // subir la imagen a ipfs
        const file = e.target.files[0];
        try {
            const added = await client.add(file, {
                progress: (prog) => console.log(`received: ${prog}`),
            });
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(url);
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    }

    async function uploadToIPFS() {
        const {
            name,
            description,
            price
        } = formInput;
        if (!name || !description || !price || !fileUrl) {
            return;
        } else {
            // primero se suben los metadatos a ipfs
            const data = JSON.stringify({
                name,
                description,
                image: fileUrl,
            });
            try {
                const added = await client.add(data);
                const url = `https://ipfs.infura.io/ipfs/${added.path}`;
                // después de cargar los metadatos en IPFS, devuelva la URL para usarla en la transacción
                return url;
            } catch (error) {
                console.log("Error uploading file: ", error);
            }
        }
    }

    async function listNFTForSale() {
        const web3Modal = new Web3Modal()
        const provider = await web3Modal.connect()
        const web3 = new Web3(provider)
        const url = await uploadToIPFS()
        const networkId = await web3.eth.net.getId()

        // Mintear el nft
        const boredStudentContractAddress = BoredStudent.networks[networkId].address
        const boredStudentContract = new web3.eth.Contract(BoredStudent.abi, boredStudentContractAddress)
        const accounts = await web3.eth.getAccounts()
        const marketPlaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
        let listingFee = await marketPlaceContract.methods.getListingFee().call()
        listingFee = listingFee.toString()
        boredStudentContract.methods.mint(url).send({ from: accounts[0] }).on('receipt', function (receipt) {
            console.log('minted');
            // Listar el nft
            const tokenId = receipt.events.NFTMinted.returnValues[0];
            marketPlaceContract.methods.listNft(boredStudentContractAddress, tokenId, Web3.utils.toWei(formInput.price, "ether"))
                .send({ from: accounts[0], value: listingFee }).on('receipt', function () {
                    console.log('listed')
                    router.push('/')
                });
        });
    }
}
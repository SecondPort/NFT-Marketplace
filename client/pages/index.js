import Web3 from 'web3';
import Web3Modal from 'web3modal';
import {useEffect, useState} from 'react';
import axios from 'axios';

import Marketplace from '../contracts/ethereum-contracts/Marketplace.json';
import BoredStudent from '../contracts/ethereum-contracts/BoredStudent.json';

export default function Home(){
  const[nfts,setNfts] = useState([]);
  const[loadingState,setLoadingState] = useState('no cargado');

  useEffect(() => { loadNFTs() }, []);

  async function loadNFTs(){
    const web3Modal = new Web3Modal();
    const provider = await web3Modal.connect();
    const web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();

    //obtener todos los nfts listados
    //dentro del json se encuentran los abis que es un diccionario y se accedden con el nombre del contrato lo mismo con el const listado
    const marketplaceContract = new web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address);
    const listados = await marketplaceContract.methods.getListings().call();

    //iterar sobre los nfts listados y obtener su metadata
    const nfts = await Promise.all(listings.map(async (i) =>{
      try{
        const boredStudentContract = await new web3.eth.Contract(BoredStudent.abi, BoredStudent.networks[networkId].address);
        const tokenURI = await boredStudentContract.methods.tokenURI(i.tokenId).call();
        const meta = await axios.get(tokenURI);
        const nft = {
          price: i.price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.buyer,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        }
        return nft;
      }catch(err){
        console.log(err)
        return null
      }
    }))
    setNfts(nfts.filter(nft => nft !== null))
    setLoadingState('loaded')
  }
}
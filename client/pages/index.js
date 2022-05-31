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
  }
}
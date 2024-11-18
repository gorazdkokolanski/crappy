import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Layout from './layouts/Layout';
import store from './redux/state';
import Orientation from './components/Orientation';

import gsap from "gsap";
import { ScrollTrigger, Observer, ScrollToPlugin, MotionPathPlugin } from "gsap/all";
import { ALCHEMY_PROVIDER_URL, birds_types, getLastSkin, abi, saveOrUpdateRoundData, getRoundData, getUserBetData, getAllUserRewardInfo } from './utils/utils';
import Button from './components/Button';
import { ABIS } from './types/types';
import { createWeb3Modal, defaultConfig, useSwitchNetwork } from '@web3modal/ethers/react';
import { createConfig, defConfig } from './utils/utils-wallet-connect';
import { useConnectWallet } from './utils/hooks/useConnectWallet';
import { BrowserProvider } from 'ethers';
import { getOwnedSkins, getRedeemedRewards, updateMyBalance } from './utils/utils-contracts';

window["round_done"] = true;
window.collected_rewards = []
if (window.web3) { window.web3 = null }

const ethersConfig = defaultConfig(defConfig)

createWeb3Modal({ ethersConfig, ...createConfig })

gsap.registerPlugin(ScrollTrigger, Observer, MotionPathPlugin, ScrollToPlugin);

// Init GSAP animation
Object.assign(window, { gsap, ScrollTrigger, Observer, MotionPathPlugin, ScrollToPlugin });

const addresses: any = {
  crappyBird: import.meta.env.VITE_CrappyBird_ADDR,
  crappyCousins: import.meta.env.VITE_CrappyCousins_ADDR,
  crappySkins: import.meta.env.VITE_CrappySkins_ADDR,
  crappyAchievements: import.meta.env.VITE_CrappyAchievements_ADDR,
  crappsToken: import.meta.env.VITE_CrappsToken_ADDR,
  crushGame: import.meta.env.VITE_CrushGame_ADDR,
}

declare global {
  interface Window {
    "scene-height": number;
    countdownTime: number;
    user_account: string;
    collected_rewards: any[];
    sounds: {
      [key: string]: () => void
    };
    closePopUp: {
      [key: string]: (b: boolean) => void;
    };
    canPlayLotti: boolean;
    web3: any;
    startedRoundTime: number;
    flyProgress: any;
    round_done: boolean;
    activeRoundID: number | string;
    endRoundTime: number;
    updateMyBalance: () => void;
    onRoundEnded: () => void;
  }
}

let ls = localStorage.getItem("crappy_sound");
const crappy_sound = ls !== null ? (ls == "true" || false) : true;

const App = () => {
  const s = store.getState();
  const [localDataBase, setLocalDataBase] = useState<any>(null);
  const { isPageLoading, web3, roundsInformation } = s;
  const [status, setLoading] = useState({ loaded: false, progress: 0, })
  const [letsPlay, setLetsPlay] = useState(false);
  const [abis] = useState<ABIS>(abi);
  const { disconnect, address, chainId, isConnected, walletProvider } = useConnectWallet()
  const { switchNetwork } = useSwitchNetwork();

  const handlePlay = (e: any) => {
    setLetsPlay(true)
    store.setSound(crappy_sound);
    (e.target as HTMLDivElement).classList.add("hidden")
  }

  // create and get data local data base
  useEffect(() => {

    if (window.indexedDB) {

      const request = indexedDB.open("ProdDatabase", 1);

      request.onupgradeneeded = function (event: any) {
        let db = event.target.result;
        // setLocalDataBase(db)
        if (!db.objectStoreNames.contains("RoundsStore")) {
          db.createObjectStore("RoundsStore", { keyPath: "id" });
        }
      };

      request.onsuccess = function (event: any) {
        let db = event.target.result;
        setLocalDataBase(event.target.result)
        getRoundData(db)
          .then(data => {
            data && store.setroundsInformation(data);
            // setIsLoadedDB(true)
          })
        // .catch(() => setIsLoadedDB(true));

      };
      request.onerror = function (event: any) {
        setLocalDataBase({ error: true })
      };
    } else {
      setLocalDataBase({ error: true })
    }

    return () => { }
  }, [])

  // Check is page loaded
  useEffect(() => {
    const values = Object.values(isPageLoading);

    const falseCount = values.filter(value => value === false).length;
    const progress = (falseCount / values.length) * 100;
    const loaded = progress == 100 && letsPlay;
    setLoading({ loaded, progress })

    return () => { }
  }, [isPageLoading, letsPlay])


  useEffect(() => {
    const ethereum: any = window.ethereum;



    const checkNetwork = async () => {
      // console.log("checkNetwork")
      if (chainId !== 8453) {
        try {
          // console.log("need switch network to BASE...")
          const sw = await switchNetwork(8453);
        } catch (error) {
          // console.log("rejected, user disconected")
          disconnect()
        }

      } else {
        // console.log("network is BASE, receiving a signer...")
        const instance = new BrowserProvider(walletProvider as any);
        const account = address?.toLowerCase();
        // await instance.getSigner();
        // console.log("signer was received")
        const dataWeb = { instance, account }
        store.setUserHistoryBets(getUserBetData(account || ""))
        store.setWeb3(dataWeb);
      }
    };

    const handleAccountsChanged = async (accounts: any) => {
      // console.log('handleAccountsChanged', accounts);
      window.collected_rewards = []
      const account = accounts[0]?.toLowerCase() || "";
      const dataWeb = { account }
      store.setUserHistoryBets(getUserBetData(account))
      store.setWeb3(dataWeb);

    };

    const handleChainChanged = async (chainId: any) => {
      // console.log("chainId changed by", chainId);
      // if (chainId !== "0x2105") {
      //   try {
      //     await switchNetwork(8453);
      //   } catch (error) {
      //     disconnect()
      //   }
      // } else {
      //   const ethersProvider = new BrowserProvider(walletProvider as any);
      //   store.setWeb3({ instance: ethersProvider, account: address });
      // }

    };

    if (ethereum && isConnected) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
    }
    isConnected && checkNetwork();

    return () => {

      if (ethereum) {
        ethereum.off('accountsChanged', handleAccountsChanged);
        ethereum.off('chainChanged', handleChainChanged);
      }
    };
  }, [isConnected, chainId]);

  // Init Read!! Contracts 
  useEffect(() => {
    const getContract = async () => {
      let abiData: ABIS = abis as ABIS;
      const provider = new ethers.JsonRpcProvider(ALCHEMY_PROVIDER_URL);
      const contracts: any = {}

      Object.entries(abiData).forEach(([key, abi]) => {
        const contract = new ethers.Contract(addresses[key], abi, provider);
        contracts[key] = { read: contract };
      })

      store.setContracts(contracts)
      store.setLoading({ contracts: false })
    }
    getContract()
  }, []);

  // Init Write!! Contracts & check user skin
  useEffect(() => {
    let skin = "base";
    const { instance, account } = web3

    const getContract = async () => {
      let abiData: ABIS = abis as ABIS;
      const signer = await instance.getSigner()

      const contractsWrite: any = s.contracts
      Object.entries(abiData).forEach(([key, abi]) => {
        const contract = new ethers.Contract(addresses[key], abi, signer);
        const contrantRed = contractsWrite[key] || {};
        contractsWrite[key] = { ...contrantRed, write: contract };
      })
      store.setContracts(contractsWrite)
      updateMyBalance(contractsWrite.crappyBird?.write, contractsWrite.crappsToken?.write, account)
      getOwnedSkins(s.contracts.crappySkins?.read, account)
      getAllUserRewardInfo(account, contractsWrite, true, store)

    }

    if (account) {
      const lastSkin = getLastSkin(account);
      lastSkin && birds_types.includes(lastSkin) && (skin = lastSkin);
    }
    window.user_account = account.toLowerCase()
    store.setBirdSkin(skin);
    account && setTimeout(getContract, 100);
    return () => { }
  }, [web3.account]);





  // save rounds information
  useEffect(() => {
    localDataBase && saveOrUpdateRoundData(roundsInformation, localDataBase)
    return () => { }
  }, [roundsInformation])

  return (
    <>
      <Layout {...{ status, state: store }} />
      <Orientation {...{ state: store }} />
      {status.progress == 100 && !letsPlay &&
        <div className="allow-play-button" data-orientation="true">
          <Button text="PLAY" className="w-full" onClick={handlePlay}  >
            <div className="custom--icon flex ratio icon-play"></div>
          </Button >
        </div>
      }
    </>
  );
};

export default App;

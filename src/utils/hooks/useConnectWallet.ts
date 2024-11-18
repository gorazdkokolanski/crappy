import React, { useEffect, useState, useRef } from "react";
import {
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalEvents,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";

export function useConnectWallet() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider, walletProviderType } = useWeb3ModalProvider();

  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { data } = useWeb3ModalEvents();

  useEffect(() => {
    switch (data.event) {
      case "MODAL_OPEN":
        isConnected && close();
        break;
    }
    return () => {};
  }, [data]);

  return {
    open,
    close,
    disconnect,
    data,
    address,
    chainId,
    isConnected,
    walletProvider,
    walletProviderType,
  };
}

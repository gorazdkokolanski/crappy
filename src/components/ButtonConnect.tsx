import { BrowserProvider } from "ethers";
import { Store } from "../types/state";
import Button from "./Button";
import { useWeb3Modal } from "@web3modal/ethers/react";

type Props = {
  state: Store,
  className?: string,
  icon?: string,
}

export default function ButtonConnect({ className = " ", state }: Props) {
  const { open, close } = useWeb3Modal();

  const connectWallet = async () => {
    open({ view: "Connect" })
    state.setPopUp("");
  }

  return <>
    <Button text="Connect" className={"open-connect " + className} onClick={connectWallet} >
      <div className="custom--icon text-shadow flex icon-user"></div>
    </Button >
  </>
}

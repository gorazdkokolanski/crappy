import { useEffect, useRef, useState } from "react";
import { Store } from "../../types/state"
import Text from "../ShadowText";
import Button from "../Button";
import ButtonBuyCrappy from "../ButtonBuyCrappy";
import ButtonConnect from "../ButtonConnect";
import { useDisconnect } from "@web3modal/ethers/react";


type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}


const socials = [
  // { icon: "instagram", link: "/" },
  { icon: "telegram", link: "https://t.me/CrappyOnBase" },
  { icon: "x", link: "https://x.com/CrappyBirdBase" },
]


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Settings({ isActive, cb, state }: Props) {
  const { isSound, web3 } = state.getState()
  const [active, setActive] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    isActive && setActive(isActive)
    return () => { }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["settings"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  const onDisconnect = async () => {
    await disconnect()
    state.setWeb3(null);
  }


  if (!active) return;


  return <>
    <div className="popup-overflow">
      <div className={`pop_up settings hidden`} ref={popRef}>
        <Text tag="button" className="pop_up--close font-48 close" title="Close" text="X" onClick={() => cb()} />

        <div className="wrapper flex border-16 border-black-2 mobive-allow-scroll">
          <Text className="font-48" text="Settings" />

          <div className="wrapper--sounds flex border-black-4">
            <Text className="font-36 text-blure" text="Sounds" />

            <button className="toogle text-shadow general-tab icon-volume" onClick={() => {
              isSound && window.sounds.main?.()
              state.setSound(!isSound)
            }}>
              {!isSound && <Text shadow={false} className="vol font-40" text="X" />}
            </button>
          </div>

          <div className="wrapper--soc flex">
            {socials.map(soc => <a href={soc.link} key={soc.icon} className={"general-tab text-shadow link flex icon-" + soc.icon} target="_blank"></a>)}
          </div>

          <div className="buttons flex wrap v-center">
            <ButtonBuyCrappy />
            {web3.account ? <Button text="disconnect" color="red" className="disconnect flex-1" onClick={onDisconnect} >
              <div className="custom--icon icon-user text-shadow flex"></div>
            </Button > : <ButtonConnect state={state} className="flex-1" />}
          </div>



          <div className="wrapper--v flex">
            <Text className="font-24" text="Version:" />
            <Text className="font-24 ver" text="0.6.110" />
          </div>

        </div>
      </div>
    </div>

  </>

}

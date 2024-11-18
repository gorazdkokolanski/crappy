import { Store } from "../../types/state"
import Text from "../ShadowText";
import { useEffect, useState } from "react";
import ButtonConnect from "../ButtonConnect";

type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ConnectWallet({ state, isActive, cb }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    isActive && setActive(isActive)
    return () => { }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["connect"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  if (!active) return;

  return <div className="popup-overflow">
    <div className={`pop_up connect hidden`}>

      <Text tag="button" className="pop_up--close close font-48" title="Close" text="X" onClick={() => cb()} />

      <div className="wrapper flex border-16 border-black-4">
        <Text className="font-48" text="Connect wallet" />
        <ButtonConnect state={state} />
      </div>
    </div>
  </div>


}

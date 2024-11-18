import { useEffect, useState } from "react";
import { Store } from "../../types/state"
import Text from "../ShadowText";

type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}

export default function Error({ isActive, cb, state }: Props) {
  const { opened_popup: { options } } = state.getState()
  const [active, setActive] = useState(false);

  useEffect(() => {
    isActive && setActive(isActive)
    return () => { }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["error"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  if (!active) return;


  return <>
    <div className="popup-overflow">
      <div className={`pop_up error hidden`} >
        <Text tag="button" className="pop_up--close font-48 close" title="Close" text="X" onClick={() => cb()} />

        <div className="wrapper flex border-16 border-black-2 mobive-allow-scroll h-center text-center">
          {options?.title && <Text className="font-48" text={options?.title} />}
          {options?.subtitle && <Text className="font-32" text={options?.subtitle} />}
        </div>
      </div>
    </div>

  </>

}

import { useEffect } from "react"
import { useSoundHook } from "../utils/hooks/useSoundHook";
import tapMain from "/sounds/tap_main.mp3";
import tapBack from "/sounds/tap_back.mp3";
import tapBuy from "/sounds/tap_buy.mp3";
import tapEquip from "/sounds/tap_equip.mp3";
import error from "/sounds/popup_error.mp3";
import balance from "/sounds/balance_update.mp3";


const Sounds = () => {
  const playMain = useSoundHook(tapMain);
  const playBuy = useSoundHook(tapBuy);
  const playEquip = useSoundHook(tapEquip);
  const playBack = useSoundHook(tapBack);
  const playError = useSoundHook(error);
  const playBalance = useSoundHook(balance);

  useEffect(() => {
    window.sounds = {
      main: () => playMain.play(),
      buy: () => playBuy.play(),
      equip: () => playEquip.play(),
      back: () => playBack.play(),
      error: () => playError.play(),
      balance: () => playBalance.play(),
    }

    // state.getState().basePath
    // clear is it has pathname
    // if (window.location.pathname + state.getState().basePath !== '/') {
    //   window.history.replaceState(null, '', '/');
    // }
    // setTimeout(checkCanPlaySound, 100)
    return () => { }
  }, [])

  return <></>
}

export default Sounds;
import { useEffect, useRef } from "react";
import { Store } from "../types/state";
import ConnectWallet from "./pop-ups/ConnectWallet";
import History from "./pop-ups/History";
import Settings from "./pop-ups/Settings";
import Bets from "./pop-ups/Bets";
import Leaderboard from "./pop-ups/Leaderboard";
import { tooglePopUp } from "../utils/utils";
import Shop from "./pop-ups/Shop";
import Achievements from "./pop-ups/Achievement";
import whoosh from "/sounds/popup_whoosh.mp3";
import win from "/sounds/popup_win.mp3";
import error from "/sounds/popup_error.mp3";
import Won from "./pop-ups/Won";
import { useSoundHook } from "../utils/hooks/useSoundHook";
import Error from "./pop-ups/Error";


type Props = {
  state: Store,
  status: {
    loaded: boolean,
  }
}


window.closePopUp = {};

const popups = {
  "connect": ConnectWallet,
  "settings": Settings,
  "history": History,
  "bets": Bets,
  "leader": Leaderboard,
  "shop": Shop,
  "achiev": Achievements,
  "won": Won,
  "error": Error,
}

export default function PopupsManager({ state, status }: Props) {
  const isOpen = state.getState().opened_popup.open;
  const pops = useRef<HTMLDivElement>(null)
  const playWhoosh = useSoundHook(whoosh);
  const playWin = useSoundHook(win);
  const playError = useSoundHook(error);

  const closePopUp = (p = "") => state.setPopUp(p)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Esc') closePopUp()
  }


  useEffect(() => {
    let cb: () => object | null;

    isOpen && setTimeout(() => {
      document.addEventListener('keydown', handleKeyDown);

      const popup = pops.current?.querySelector(`.${isOpen}.hidden`) as HTMLDivElement;

      switch (isOpen) {
        case "won":
          playWin.play();
          break;
        case "error":
          playError.play();
          break;
        default:
          playWhoosh.play()
          break;
      }

      if (popup) {
        const open = isOpen as string;
        const c = window.closePopUp[open]
        const t = tooglePopUp(popup);
        cb = () => t(() => { c?.(false) })
      }
    }, 10)

    return () => {
      isOpen && cb?.()
      isOpen && window.sounds.back()
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])


  return <div ref={pops}>
    {Object.entries(popups).map(popup => {
      const [key, Component] = popup;
      // const Component = popup[1];
      const active = isOpen == key;
      return <Component key={key} isActive={active} cb={closePopUp} state={state} {...status} />
    })}

  </div>
}

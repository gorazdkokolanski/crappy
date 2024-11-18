import bird from "/img/bird_svg.svg";
import Text from "../../components/ShadowText";
import generalNabs from "/img/icons/general-navs.svg";
import Button from "../../components/Button";
import { Store } from "../../types/state";
import React, { useEffect, useRef, useState } from "react";
import ButtonConnect from "../../components/ButtonConnect";
import { AnimatedCounter } from "react-animated-counter";
import UserAvatar from "../../components/UserAvatar";
import { formatLargeNumber } from "../../utils/utils";





type Props = {
  state: Store,
  status: {
    loaded: boolean,
    progress: number,
  }
}

const clampFont = () => {
  const def = 1920;
  const max = 32;
  const min = 11;
  const wW = window.innerWidth;
  let newFS: any = (max / def * wW).toFixed();

  if (newFS > max) {
    newFS = max
  }
  if (newFS < min) {
    newFS = min
  }

  return newFS
}
const leftTabs = ["shop", "achiev", "leader",]

const Tab = ({ tab, state, opened }: { tab: string, state: Store, opened: any }) => {

  const toogleClick = () => {
    state.setPopUp(tab)
    window.sounds.main?.()
  }

  return <>
    <button className={`general-tab ${tab}`} key={tab} onClick={toogleClick} disabled={opened == tab} >
      <svg className="icon text-shadow icon-58 ratio">
        <use href={`${generalNabs}#${tab}`}></use>
      </svg>
    </button>
  </>



}
export default function Header({ state, status }: Props) {
  const title = "Crappy bird";
  const { web3, myBalance, myRewardsData } = state.getState();
  const animateRef = useRef<HTMLDivElement>(null);
  const [fontSize] = useState(clampFont())
  const opened = state.getState().opened_popup.open

  const formatedPrice = formatLargeNumber(myBalance.crapps);

  const [integer, fractional] = formatedPrice.number.split('.');

  useEffect(() => {
    myBalance.crapps && window.sounds?.balance()
    const span = animateRef.current?.querySelectorAll(".ticker-view span");
    span?.forEach((s: any) => s.setAttribute("data-text", s.textContent))
    return () => {
    }
  }, [myBalance.crapps])


  return (
    <header className={"header" + (status.loaded ? "" : " loading")} data-orientation="true">

      <div className="header--left flex">
        <div className="logo flex">
          <Text className="logo--title" text={title} />
          <div className="flex logo--bird">
            <img src={bird} alt={title} />
          </div>
        </div>

        <div className={"buttons flex onloaded"}>


          {leftTabs.map((t) => <Tab tab={t} key={t} {...{ state, opened }} />)}
        </div>
      </div>


      <div className="header--right flex onloaded">

        <div className="buttons flex">

          {web3.account && <Button color="blue" title={Number(myBalance.crapps).toLocaleString('en-US') + " CRAPPS"}  >
            <div className="custom--icon text-shadow icon-coin-gold-crapps"></div>

            <div className="custom--text flex" ref={animateRef}>
              <AnimatedCounter
                value={Number(integer.replace(",", ""))}
                color="white"
                fontSize={fontSize + "px"}
                decimalPrecision={0}
                incrementColor={"white"}
                decrementColor={"white"}
                includeCommas
              />
              {fractional?.[0] && <>
                <span data-text="." className="stroke text-shadow" style={{ fontSize: fontSize + "px", height: (fontSize * 1.1) + "px" }}>.</span>
                <AnimatedCounter
                  value={Number(fractional[0])}
                  color="white"
                  fontSize={fontSize + "px"}
                  decimalPrecision={0}
                  incrementColor={"white"}
                  decrementColor={"white"}
                  includeCommas
                />
              </>}




            </div>
            {formatedPrice.unit && <span data-text={formatedPrice.unit} className="stroke text-shadow unit" style={{ fontSize: fontSize + "px", height: (fontSize * 1.1) + "px" }}>{formatedPrice.unit}</span>}
          </Button >}

          {web3.account && <UserAvatar lvl={Number(myRewardsData.levelOf)} />}

          {!web3.account
            ? <ButtonConnect state={state} />
            : <Tab tab={"history"} {...{ state, opened }} />
          }

          <Tab tab={"settings"} {...{ state, opened }} />
        </div>
      </div>


    </header>

  );
}

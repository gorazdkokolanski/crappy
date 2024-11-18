import { useContext, useEffect, useRef, useState } from "react";
import { Store } from "../../types/state"
import Text from "../ShadowText";
import Button from "../Button";
import generalNabs from "/img/icons/general-navs.svg";
import { crappsPerSecond } from "../../utils/utils";
import AnimContext from "../../layouts/AnimationProvider";


type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}
type Bet = {
  amount: number;
  multiplier: number;
}
function formatNumber(number: number) {
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Won({ isActive, cb, state }: Props) {
  const [active, setActive] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const [isWon, setIsSomeWon] = useState(false);
  const [wonMyBet, setWonMyBet] = useState(false)
  const [myBet, setMyBet] = useState<Bet>({ amount: 0, multiplier: 0 })
  const { web3: { account }, roundBets, flyProgress, settings, myRewardsData } = state.getState();
  const anim = useContext(AnimContext)
  const roundMultiplier: any = anim?.roundMultiplier;

  const coinPerSec = crappsPerSecond(state.getState());


  const culcWonCrapps = () => {
    const coff = Math.min(myBet.multiplier, roundMultiplier)
    const mm = coinPerSec * Math.round(settings.minBreakDuration + settings.breakDurationFactor * coff)
    return mm.toLocaleString('en-US')
  }

  useEffect(() => {

    if (isActive) {
      const bet = flyProgress >= Number(myBet.multiplier);
      setActive(isActive)
      setIsSomeWon(bet || Boolean(Number(myRewardsData.levelOf)))
      setWonMyBet(bet)
    }


    return () => {
      // isActive &&  setMyBet({ amount: 0, multiplier: 0 })
      // isActive &&  setIsSomeWon(false)
    }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["won"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  useEffect(() => {
    const myBet: any = roundBets[account?.toLowerCase()];
    if (myBet) {
      setMyBet(myBet);
    }
    return () => {

    }
  }, [roundBets, account])


  if (!active) return;


  return <>
    <div className="popup-overflow">
      <div className={`pop_up won hidden`} ref={popRef}>
        <Text tag="button" className="pop_up--close font-48 close" title="Close" text="X" onClick={() => cb()} />

        <div className="wrapper flex border-16 border-black-2 mobive-allow-scroll">
          <Text className="font-48" text="you won!" />

          <div className="wrapper--multiplier flex column v-center text-center">

            {isWon ? <>
              {wonMyBet && <>
                <Text className="font-48 xx" text={`x${myBet.multiplier}`} />
                <Text className="font-32" text="multiplier" />
              </>}
            </> : <>
              <Text className="font-32" text="a life lesson! " />
              <Text className="font-32" text="Crappy has a lot of influential cousins. Use them!" />
            </>}
          </div>

          {isWon
            ? <>
              <div className="wrapper--coins flex border-black-4 h-center">
                <div>
                  {wonMyBet && <div className="coins flex v-center">
                    <div className="icon icon-28 icon-coin-silver-crappy"></div>

                    <Text className="font-36 text-blure" text={formatNumber(myBet.amount * myBet?.multiplier)} />
                  </div>}
                  {myRewardsData.levelOf > 0 && <div className="coins flex v-center">
                    <div className="icon icon-28 icon-coin-gold-crapps"></div>
                    <Text className="font-36 text-blure" text={culcWonCrapps()} />
                  </div>}
                </div>
              </div>

              {myRewardsData.levelOf > 0 && <>
                <div className="wrapper--crapps flex column v-center">

                  <div className="crapps flex h-center border-black-2">
                    <div className="icon flex cover">
                      <img src={`./img/cousins/lvl_${myRewardsData.levelOf}.svg`} alt="" />
                    </div>
                  </div>

                  <div className="coins flex v-center">
                    <Text className="font-48" text="+" />
                    <div className="icon icon-58 icon-coin-gold-crapps"></div>
                    <Text className="font-48" text={coinPerSec.toLocaleString('en-US') + "/s"} upper={false} />
                  </div>
                </div>
              </>}
            </>
            : <div className="flex h-center">

              <Button text={"UNLOCK COUSINS"} className="w-full" onClick={() => {
                state.setPopUp("shop")
              }}>
                <div className="custom--icon text-shadow flex general-tab ratio">
                  <svg>
                    <use href={`${generalNabs}#achiev`}></use>
                  </svg>
                </div>
              </Button >
            </div>}

        </div>
      </div>
    </div>

  </>

}

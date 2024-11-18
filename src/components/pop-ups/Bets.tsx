import { Store } from "../../types/state"
import ScrollBarWrapper from "../ScrollBarWrapper";
import { useEffect, useState } from "react";
import Button from "../Button";
import Text from "../ShadowText";
import UserAvatar from "../UserAvatar";
import { shortenAddress } from "../../utils/utils";

type Props = {
  state: Store,
  isActive: boolean,
  loaded: boolean,
  cb: (b?: string) => void
}

type UserBet = {
  amount: number,
  multiplier: number,
  user: string
  lvl: any
}

function formatNumber(number: number) {
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


const Row = ({ bet, isMe, isWon, state }: { bet: UserBet, isMe: boolean, isWon: boolean, state: Store }) => {
  const { contracts } = state.getState()
  const [level, setLevel] = useState(null)
  const { multiplier, user, amount, lvl } = bet;
  const name = shortenAddress(user);

  useEffect(() => {
    if (lvl) {
      setLevel(lvl)
    } else {
      (async () => {
        const lvl = await contracts.crappyCousins?.read.levelOf(user)
        setLevel(lvl);
      })()
    }

    return () => { }
  }, [lvl])


  return <>
    <div className={"grid--row" + (isMe ? " my_bet" : " else_bet")}>
      <div className={"grid--row-block border-black-4 border-4 flex v-center" + (isMe && isWon ? " my_win" : "") + (isWon ? " winner" : "")}>

        <div className="user-info flex v-center">
          {<UserAvatar lvl={Number(level)} />}

          <div >
            <p className="name font-20-md">{name}</p>

            <div className="count flex v-center">
              <div className="icon text-shadow icon-coin-silver-crappy"></div>
              <p className="c font-16">{formatNumber(amount)}</p>
            </div>
          </div>
        </div>


        <div className="coff flex">
          <p className="font-24">X{Number(multiplier || "").toFixed(2)}</p>
        </div>
      </div>
    </div>
  </>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Bets({ isActive, cb, loaded, state }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [bets, setBets] = useState<any[] | null>(null)
  const { web3: { account }, roundBets, flyProgress, leaderboard } = state.getState();



  const handleChangeTab = (e: any) => {
    setActiveTab(e.target?.name)
  }

  const isActiveTab = (key: string) => {
    return activeTab == key ? " active" : ""
  }

  useEffect(() => {
    const entries = Object.entries(roundBets);
    const betsArr = entries?.length ? entries.map(([user, value]) => ({ user, ...value, lvl: leaderboard ? leaderboard[user.toLowerCase()]?.levelOf : null })) : null;
    betsArr && betsArr.length > 1 && betsArr.sort((a: any, b: any) => parseFloat(b.multiplier) - parseFloat(a.multiplier));
    setBets(betsArr)
    return () => { }
  }, [roundBets, leaderboard])



  const props = {
    onClick: handleChangeTab,
    buttonType: "tab",
    font: "20",
  }

  return <>

    <div className="popup-overflow bets">
      <div className={`pop_up bets dif ${isActive ? "active" : ""} ${loaded ? "" : " loading"}`}>
        <div className="wrapper flex border-4 border-black-2">

          <div className="wrapper--tabs flex w-full">
            <Button text={"All Bets"} name="all" className={isActiveTab("all")} {...props} />
            {account && <Button text={"My Bets"} name="my" className={isActiveTab("my")} {...props} />}
          </div>
          <div className="pop_up--overflow">
            <ScrollBarWrapper>
              <div className={"grid tab_" + activeTab}>
                {bets?.length
                  ? bets.map((bet: UserBet, id: number) => {
                    return <Row key={id} state={state} bet={bet} isMe={bet.user.toLowerCase() == account?.toLowerCase()} isWon={flyProgress >= bet.multiplier} />
                  })
                  : <div className="no_bets w-full flex v-center h-center">
                    <Text text={"There are no bets yet"} className="font-18" />
                  </div>}
              </div>
            </ScrollBarWrapper>
          </div>

        </div>

        <div className="toogle flex" onClick={() => cb(isActive ? "" : "bets")}>
          <Button color="blue-light" isSmall={false}   >
            <div className="custom--icon flex ratio icon-play"></div>
          </Button >
        </div>

      </div>
    </div>

  </>


}

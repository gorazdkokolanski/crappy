import { useContext, useEffect, useState } from "react";
import Text from "../../components/ShadowText";
import Avatar from "./component/Avatar";
import Balance from "./component/Balance";
import InputCashout from "./component/InputCashout";
import InputCrappy from "./component/InputCrappy";
import generalNabs from "/img/icons/general-navs.svg";

import { Store } from "../../types/state";
import { ethers } from "ethers";
import Button from "../../components/Button";
import { updateMyBalance } from "../../utils/utils-contracts";
import AnimContext from "../AnimationProvider";
import { goToBaseScan } from "../../utils/utils";

type Errors = {
  crappy: "insufficient" | "max" | "",
  cashout: "insufficient" | "max" | "",
}
type Props = {
  state: Store,
  status: {
    loaded: boolean,
    progress: number,
  }
}


export default function Footer(props: Props) {
  const { state, status } = props
  const s = state.getState();
  const { myBalance, roundID, web3: { account }, contracts, roundBets, settings } = s;
  const { crushGame, crappyBird, } = contracts;

  const max_bet_value = Number(settings.maximumBetSize);
  const crappyInputState = useState<string | number>("");
  const cashoutInputState = useState<any>("");
  const [isSomeError, setError] = useState<Errors>({ crappy: "", cashout: "" });
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isCrapping, setIsCrapping] = useState(false);
  const [isBetted, setIsBetted] = useState(false);
  const round = useContext(AnimContext)
  const [crappyValue] = crappyInputState;
  const [multiplierValue] = cashoutInputState;

  const checkError = (val: any, max = Infinity) => {
    const count = Number(val);
    let error: Errors["crappy"] = "";

    if (count > myBalance.crappy) {
      error = "insufficient"
    }
    if (count > max) {
      error = "max"
    }

    return error;
  }
  const checkCrapButtonDisabled = () => {
    const err = Boolean(isSomeError.cashout
      || isSomeError.crappy
      || myBalance.crappy == 0
      || !crappyValue
      || !multiplierValue
      || isBetted
      || round?.flyRoundStarted.started
      || round?.roundIsGoing
      || round.showSOONToolTip == true
    )

    return account ? err : false
  }

  const handlePlaceBet = async () => {

    if (!account) {
      state.setPopUp("connect");
      return;
    }

    if (!crushGame || !crappyValue || !multiplierValue || isCrapping) return;

    setIsCrapping(true)

    const amount = ethers.parseEther(`${crappyValue}`);
    const multiplier = Math.floor(multiplierValue * 100);

    const aprove = async () => {
      //  console.log('approving...');
      const approve = await crappyBird?.write.approve(crushGame.read.target, amount);
      await approve.wait()
      //  console.log('approved');
    }

    const bet = async () => {
      //  console.log('placing a bet...');
      const placeBet = await crushGame.write.placeBet(amount, multiplier);
      await placeBet.wait();
      //  console.log('placed a bet');
    }

    try {
      await aprove();
    } catch (e) {
      //  console.log("approved error", e);
      setIsCrapping(false);
      return;
    }

    try {
      await bet();
    } catch (e) {
      //  console.log("bet error", e);
      setIsCrapping(false);
      return;
    }

    // clear inputs
    crappyInputState[1]("")
    cashoutInputState[1]("")

    // disabled Bet button
    setIsBetted(true);
    updateMyBalance()
    setIsCrapping(false)
  };


  useEffect(() => {
    if (account) {
      const crappy = checkError(crappyValue, max_bet_value)
      setError(e => ({ ...e, crappy }));
    }

    return () => { }
  }, [crappyValue])

  useEffect(() => {
    if (account) {
      let cashout: any = checkError(multiplierValue, 100)
      if (multiplierValue && (multiplierValue < 1.01)) {
        cashout = "max"
      }
      setError(e => ({ ...e, cashout }));
    }

    return () => { }
  }, [multiplierValue])

  useEffect(() => {
    if (account) {
      const my = roundBets[account.toLowerCase()]
      setIsBetted(Boolean(my))
    }
    return () => { }
  }, [roundBets, account])

  useEffect(() => {
    status.loaded && setTimeout(() => setPageLoaded(true), 1000)
    return () => { }
  }, [status.loaded])


  return (
    <footer className="footer">

      <div className="footer--loading">
        <div className="progress"></div>
        {!pageLoaded &&
          <>
            <div className="line" style={{ left: status.progress + "%" }}></div>
            <Text className={"font-48" + (status.loaded ? " loaded" : "")} text="Loading..." />
          </>}
      </div>
      <div className={"footer--content" + (status.loaded ? "" : " loading") + (!pageLoaded ? " transition" : "")} data-orientation="true">

        <div className="footer--hash flex v-center pointer" onClick={goToBaseScan}>
          <div className="flex">
            <svg className="footer--hash-icon">
              <use href={`${generalNabs}#hash`}></use>
            </svg>
          </div>
          <p className="font-18 hash--id text-center">Round <br />
            #{roundID.toString()}</p>
        </div>

        <InputCashout cashoutInput={cashoutInputState} error={isSomeError.cashout} account={account} />
        <InputCrappy crappyInput={crappyInputState} error={isSomeError.crappy} myBal={myBalance.crappy} account={account} maxBet={max_bet_value} />
        <Avatar {...{ state, account }} />
        <Balance {...{ myBalance, account }}>
          <Button
            text={"crap"}
            className={"w-full crap-place-bet" + (isCrapping ? " crapping" : "")}
            disabled={checkCrapButtonDisabled()}
            onClick={handlePlaceBet} >
            <div className={`custom--icon text-shadow flex ratio icon-${isCrapping ? "loading" : "play"}`}>
            </div>
          </Button >
        </Balance>

      </div>

    </footer>
  );
}

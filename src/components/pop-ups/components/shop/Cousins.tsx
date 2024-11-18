import React, { useState } from "react";
import Text from "../../../ShadowText";
import Button from "../../../Button";
import { Store } from "../../../../types/state";
import { CousinsNames, crappsPerSecond, formatLargeNumber, initUserLeaders, updateUserLeaderData } from "../../../../utils/utils";

type Props = {
  state: Store,
  lvl: number,
}

const DESCRIPTION = {
  active: "if you have a crappy cousin active, you will collect crapps at the end of each round!",
  next: "if you upgrade your crappy cousin, you will collect more crapps at the end of each round!"
}


const CousinActive = ({ lvl, state }: Props) => {
  const { contracts, web3: { account }, minimumBets, myRewardsData } = state.getState();
  const [loading, setLoading] = useState(false)
  const minLVL = lvl || 1;
  const coinPerSec = crappsPerSecond(state.getState());
  const cousinName = CousinsNames[minLVL - 1] ?? `Cousin ${minLVL}`

  const activateCousin = async () => {
    setLoading(true);

    try {
      const redeem = await contracts.crappyCousins?.write.redeem()
      await redeem.wait();
      state.setMyRewardsData({ "levelOf": 1 })

    } catch (error: any) {
      setLoading(false);
      // state.setPopUp("error", { title: "Something went wrong!", subtitle: "Try again later" });
    }

  }

  return <>

    <div className="wrapper--skin block border-black-4 border-8">

      <div className="flex column v-center">
        <Text text={cousinName} className="font-32" />
        <Text text={"lvl " + minLVL} className="lvl font-24" />
      </div>

      <div className="icon-skin flex cover ratio">
        <img src={`./img/cousins/lvl_${minLVL}.svg`} alt="" />
      </div>
      <div className="flex column v-center">
        <Text text={DESCRIPTION.active} upper={false} className="font-20 text-center" />
        <div className="flex v-center my-coin">
          <Text text={coinPerSec.toLocaleString('en-US')} className="font-24" />
          <div className="icon-coin icon-28 icon-coin-gold-crapps"></div>
          <Text text="/s" upper={false} className="font-24" />
        </div>
      </div>

      <div className="status flex v-center w-full h-center">
        {
          account && lvl == 0 && myRewardsData.betsPlaced >= minimumBets
            ? <Button text={"activate"} className={`w-full${loading ? " pointer-none" : ""}`} onClick={activateCousin} sound="buy" >
              {loading && <div className={`custom--icon text-shadow flex ratio icon-28 icon-loading`} />}
            </Button >
            : <Text text={(myRewardsData.betsPlaced && myRewardsData.betsPlaced < minimumBets) || !account ? `Play ${minimumBets} games to unclock` : "active"} className="font-32 text-center" />
        }
      </div>

    </div>

  </>
}

const CousinNext = ({ lvl, state }: Props) => {
  const { web3: { account }, contracts: { crappyCousins }, myBalance, crappsPer, myRewardsData } = state.getState();
  const [loading, setLoading] = useState(false)
  const coinPerSec = crappsPerSecond(state.getState(), true);
  const cousinName = CousinsNames[lvl - 1] ?? `Cousin ${lvl}`

  function requiredXP() {
    return crappsPer.factor * Math.pow(lvl - 1, 2)
  }
  const costToUpgrade = requiredXP();
  const formatedPrice = formatLargeNumber(costToUpgrade);


  const connect = () => state.setPopUp("connect");

  const updateCousinLevel = async () => {
    if (!crappyCousins || loading) return;
    setLoading(true);
    try {
      const lv = await crappyCousins.write.levelUp();
      await lv.wait()
      window.updateMyBalance?.()
    } catch (error) {
      setLoading(false);
    }
    setLoading(false);

  }

  const checkUpdate = () => {
    account ? updateCousinLevel() : connect()
  }

  return <>

    <div className="wrapper--skin block border-black-4 border-8">

      <div className="flex column v-center">
        <Text text={cousinName} className="font-32" />
        <Text text={"lvl " + lvl} className="lvl font-24" />
      </div>

      <div className="icon-skin flex cover ratio">
        <img src={`./img/cousins/lvl_${lvl}.svg`} alt="" />
      </div>
      <div className="flex column v-center">
        <Text text={DESCRIPTION.next} upper={false} className="font-20 text-center" />
        <div className="flex v-center my-coin">
          <Text text={coinPerSec.toLocaleString('en-US')} className="font-24" />
          <div className="icon-coin icon-28 icon-coin-gold-crapps"></div>
          <Text text="/s" upper={false} className="font-24" />
        </div>
      </div>

      <div className="status flex v-center w-full h-center">
        <Button
          text={`${formatedPrice.number} ${formatedPrice.unit}`}
          className={`w-full${loading ? " pointer-none" : ""}`}
          onClick={checkUpdate}
          sound="buy"
          title={costToUpgrade.toLocaleString('en-US') + " CRAPPS"}
          disabled={myBalance?.crapps < costToUpgrade || myRewardsData.levelOf == 0}
        >
          <div className={`custom--icon text-shadow flex ratio icon-28 icon-${loading ? "loading" : "coin-gold-crapps"}`} />
        </Button >
      </div>

    </div>

  </>
}


export default function Cousins({ state }: { state: Store }) {
  const { myRewardsData, crappsPer } = state.getState();
  // const per = crappsPer.per_factor * crappsPer.per_multiplier;
  const per = crappsPer.factor * 1;
  const level = Number(myRewardsData.levelOf)
  const isMaxLvl = level >= crappsPer.maxLevel;

  return <>
    <div className="wrapper--cousins flex flex-1 w-full">
      <CousinActive lvl={level}  {...{ state }} />
      {!isMaxLvl && <>
        <div className="upgrade flex column v-center h-center">
          <div className="icon flex ratio text-shadow icon-58"></div>
          <Text text="UPGRADE" className="font-20" />
        </div>
        <CousinNext lvl={(level || 1) + 1} {...{ state }} />
      </>}

    </div>
  </>

}


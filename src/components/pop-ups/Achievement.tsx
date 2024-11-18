import React, { useEffect, useState } from "react";
import { State, Store } from "../../types/state"
import Text from "../ShadowText";
import ScrollBarWrapper from "../ScrollBarWrapper";
import Button from "../Button";
import connect from "/img/icons/connect.svg";
import { formatLargeNumber, getAllUserRewardInfo, Reward_Type } from "../../utils/utils";
import { GameReward } from "../../types/types";
import { ethers } from "ethers";
import { getRedeemedRewards, getTotalRewards } from "../../utils/utils-contracts";


const max_number = 100000
type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}


type Achievement = {
  title?: string;
  description?: string;
  progress: number | string;

  isActive: boolean,
  isCollected: boolean,
  isLocked?: boolean,
  custom?: boolean,
} & GameReward

const lockedAchievement: Achievement = {
  title: "UNLOCK CRAPPY SHOP",
  description: "Play 10 Games",
  progress: 9,
  requirement: 10,
  rewardType: "",
  rewardAmount: 1000,
  isCollected: false,
  isActive: false,
  isLocked: true,
  index: -1

}

function addSpacesToCamelCase(str: String) {
  return str.replace(/([A-Z])/g, ' $1').trim();
}

const mapRewardsFromContract = (r: GameReward, s: State) => {
  const { myRewardsData, myRedeemedRewards } = s;
  const { rewardType } = r;
  const title = addSpacesToCamelCase(rewardType);
  let progress = rewardType ? myRewardsData[rewardType] : "0";
  let requirement = r.requirement;
  let isCollected = myRedeemedRewards.includes(r.index);
  // console.log("rewardType", rewardType)


  switch (rewardType) {
    case "highestCrushMultiplier":
      progress = (Number(progress) / 100).toFixed(2)
      requirement = (Number(requirement) / 100).toFixed(2)
      break;
    case "highestCrushWin":
    case "totalCrushWinnings":
      progress = ethers.formatEther(progress);
      requirement = ethers.formatEther(requirement);
      break;
  }

  return ({
    title,
    progress,
    isCollected,
    isActive: Number(progress) >= Number(r.requirement) && !isCollected,
    ...r,
    requirement
  })
}

const formatNumber = (n: any) => {
  let num = Number(n)
  let ress = num

  if (num >= max_number) {
    let ress = formatLargeNumber(num);
    return `${ress.number} ${ress.unit}`
  }
  return ress.toLocaleString('en-US');
}


const Row = ({ data, state }: { data: Achievement, state: Store }) => {
  const [loading, setLoading] = useState(false);
  const [isCollected, setisCollected] = useState(data.isCollected)
  const [isActive, setIsActive] = useState(data.isActive);

  useEffect(() => {
    setisCollected(data.isCollected)
    setIsActive(data.isActive)
    return () => { }
  }, [data.isActive, data.isCollected])

  // const isActive = data.isActive;
  // const isCollected = data.isCollected;
  const title = data.title;
  const description = data.description;
  const won = data.rewardAmount;
  const isLocked = data?.isLocked;
  const place = isLocked ? "locked" : isActive && !isCollected ? "active" : isCollected ? "collected" : "in-go";
  const progress = data.progress;
  const requirement = data.requirement;

  const pgPr = Number(progress) / Number(requirement);

  const show_have = formatNumber(progress);
  const show_need = formatNumber(requirement);


  const onClollected = () => {
    setisCollected(true)
    setIsActive(false)
    state.setMyRedeemedRewards(data.index)
  }

  const handeOnCollect = async () => {
    if (data.custom) {
      return state.setPopUp("shop", { title: "crappy" })
    }

    if (data.index !== null) {
      const constract = state.getState().contracts.crappyAchievements?.write;

      try {
        setLoading(true)
        // console.log("redeem, index:", data.index, "type:", data.rewardType)
        const result = await constract?.redeemReward(data.index);
        await result.wait();
        window.updateMyBalance()
        setLoading(false)
        onClollected()
      } catch (error) {
        // const formattedError = JSON.parse(JSON.stringify(error, null, 2));
        // switch (formattedError.code) {
        //   case "CALL_EXCEPTION":
        //     onClollected()
        //     break;
        //   default:
        //     break;
        // }
        setLoading(false)
      }

    }
  }

  const handeOnGoing = () => {
    switch (data.rewardType) {
      case "totalCrappySkins":
        return state.setPopUp("shop")
      case "levelOf":
        return state.setPopUp("shop", { title: "crappy" })
      default:
        state.setPopUp(false)
        break;
    }

  }



  return <>
    <div className="wrapper--grid-row" style={{ order: isCollected ? 3 : isActive ? 1 : 2 }}>
      <div className={"block border-black-4 border-16 flex font-16-bl " + place}>

        <div className="row row_name">
          <div className="icon-place ratio"></div>
          <div>
            <p className="font-24 title upper">{title}</p>
            <p className="font-16-md description">{description}</p>
          </div>
        </div>

        {!isLocked && <>

          <div className="row row_progress">

            {!isCollected && <div className="progress-line border-black-4 border-4">
              {Boolean(pgPr) && <div className={"line " + (pgPr >= 1 ? "done" : "")} style={{ width: pgPr * 100 + "%" }}></div>}
              <Text className="font-24 progress-num" text={`${show_have}/${show_need}`} />
            </div>}

          </div>

          <div className="row row_won">

            {!data.custom && <>
              {isCollected ?
                <Text text={`${won.toLocaleString('en-US')}`} className="font-24" /> :
                <p className="font-24 won-coin">{won.toLocaleString('en-US')}</p>
              }
              <div className="icon-coin text-shadow icon-coin-gold-crapps"></div>

            </>}

          </div>
        </>}

        <div className="row row_last">
          {isLocked ?
            <p className="font-18 upper">Unlock after 10 games</p>
            : isActive && !isCollected ?
              <Button text="collect" font="18" className="md action-btn" onClick={handeOnCollect} disabled={loading} >
                {loading
                  ? <div className={`custom--icon md text-shadow ratio icon-loading`} />
                  : <div className="custom--icon md text-shadow flex"><img src={connect} alt="" /></div>
                }
              </Button > :
              isCollected ?
                <Text text="Collected" className="font-18 " /> :
                <Button text="Go" font="18" color="blue-light" className="md action-btn" onClick={handeOnGoing} >
                  <div className="custom--icon md text-shadow flex"><img src={connect} alt="" /></div>
                </Button >
          }
        </div>
      </div>

    </div>
  </>
}

export default function Achievements({ isActive, cb, state }: Props) {
  const s = state.getState()
  const [active, setActive] = useState(false);
  const { web3: { account }, minimumBets, totalGameRewards, myRewardsData, myRedeemedRewards, contracts } = s;
  const [rewards, setRewards] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);


  const hardcodedAchievement: Achievement[] = [
    {
      title: "UNLOCK CRAPPY SHOP",
      description: `Play ${minimumBets} Games`,
      requirement: minimumBets,
      rewardAmount: 1000,
      custom: true,
      rewardType: "betsPlaced",
      progress: myRewardsData.betsPlaced,
      isCollected: myRewardsData.betsPlaced >= minimumBets && myRewardsData.levelOf > 0,
      isActive: myRewardsData.betsPlaced >= minimumBets && myRewardsData.levelOf == 0,
      index: -1,
    }
  ]


  const loadReward = async () => {
    if (account) {
      await getTotalRewards();
      await getRedeemedRewards(account);
    }
    setTimeout(() => setLoading(false), 300)
  }

  useEffect(() => {
    if (isActive) {
      setActive(isActive)
      loading && loadReward()
    }
    return () => { }
  }, [isActive])

  useEffect(() => {
    setLoading(true)
    return () => { }
  }, [account])


  useEffect(() => {
    window.closePopUp["achiev"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  useEffect(() => {
    let achievementsArray: Achievement[] = Array(15).fill(lockedAchievement);

    if (account) {
      const mapedRewards = totalGameRewards.map((r: any) => mapRewardsFromContract(r, s));
      achievementsArray = [...hardcodedAchievement, ...mapedRewards]
    }
    setRewards(achievementsArray)
    return () => { }
  }, [totalGameRewards, myRewardsData, account, myRedeemedRewards])


  if (!active) return;
  return <>
    <div className="popup-overflow achiev">
      <div className={`pop_up achiev hidden`}>
        <Text tag="button" className="pop_up--close close font-48" title="Close" text="X" onClick={() => cb()} />

        <div className="wrapper flex border-16 border-black-2">
          <Text className="font-48" text="Achievements" />

          <div className="pop_up--overflow">
            <ScrollBarWrapper>
              {loading ?
                <div className="flex v-center h-center flex-1" style={{ height: "100%" }}>
                  <div className="flex v-center gap-12">
                    <div className={`text-shadow icon-28 icon-loading`} />
                    <Text className="font-28" text="Achievements in flight... just a bit of patience!" upper={false} />
                  </div>
                </div> :
                <div className="wrapper--grid">
                  {rewards.map((achiev, id: number) => <Row key={id} data={achiev} state={state} />)}
                </div>}
            </ScrollBarWrapper>
          </div>

        </div>
      </div>
    </div>

  </>

}

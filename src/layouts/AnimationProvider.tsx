import React, { createContext, useState } from "react";
import { useEffect } from "react";
import { Store } from "../types/state";
import { getACurrentRoundBets, getGeneralSettings, getRoundID } from "../utils/utils-contracts";
import { consoleLog, initRoundsBatch, REWARD_LevelOf, Reward_Type, updateUserLeaderData } from "../utils/utils";
import { Round } from "../types/types";
import Tooltip from "../components/Tooltip";
import { ethers } from "ethers";

const def: any = {}

export type Timer = {
  play: boolean,
  playIdle: boolean,
  isRound: boolean
  showPayout: boolean,
}

type Status = {
  started?: boolean,
  ended?: boolean,
  break?: boolean,
}

type FirstLoad = {
  loading?: boolean,
  loaded?: boolean,
  done?: boolean,
}

export type Progress = {
  progress: number | string | boolean,
  isDone: boolean
}

interface AnimContextType {
  flyRoundStarted: Status;
  roundIsGoing: boolean;
  roundMultiplier: string | number,
  countdownTimer: string | number,
  showSOONToolTip: boolean | null,
  animationTimer: Timer,
  roundInfo: Round,
  flightProgress: Progress,
  setFlightProgress: React.Dispatch<React.SetStateAction<Progress>>,
  setAnimationTimer: React.Dispatch<React.SetStateAction<Timer>>,
  setSOONToolTip: React.Dispatch<React.SetStateAction<boolean | null>>,
  setCountdownTimer: React.Dispatch<React.SetStateAction<string | number>>,
  setRoundMultiplier: React.Dispatch<React.SetStateAction<string | number>>,
  setFlyRoundStarted: React.Dispatch<React.SetStateAction<Status>>;
  setRoundIsGoing: React.Dispatch<React.SetStateAction<boolean>>;
}


const AnimContext = createContext<AnimContextType>(def);

const checkIfMyAccount = (acc: string) => {
  return window.user_account == acc.toLowerCase()
}

type Props = {
  state: Store,
  children: any,
  status: any,
}

export function AnimationProvider({ children, state, status }: Props) {
  const s = state.getState();
  const { contracts, roundID, roundBets, roundsInformation, web3 } = s;
  const [flyRoundStarted, setFlyRoundStarted] = useState<Status>({});
  const [roundIsGoing, setRoundIsGoing] = useState(false);
  const [roundMultiplier, setRoundMultiplier] = useState<string | number>(0);
  const [countdownTimer, setCountdownTimer] = useState<string | number>(0)
  const [roundInfo, setRoundInfo] = useState<Round>(def);
  const [showSOONToolTip, setSOONToolTip] = useState<boolean | null>(null);
  const [animationTimer, setAnimationTimer] = useState<Timer>({ play: false, playIdle: true, isRound: false, showPayout: false })
  const [flightProgress, setFlightProgress] = useState<Progress>({ progress: false, isDone: false });
  const [isNewRounStarted, setNewRounStarted] = useState<number | boolean>(false);
  const [isFirstDataLoaded, setFirstDataLoaded] = useState<FirstLoad>({})

  const saveRoundInfo = (roundInfo: Round) => {

    const data = { ...roundsInformation }
    const multiplier = (Number(roundInfo.multiplier) / 100).toFixed(2);

    data.last_roundID = roundID;
    data.rounds[roundID] = {
      betts: Object.keys(roundBets),
      info: {
        endTime: Number(roundInfo.endTime),
        startTime: Number(roundInfo.startTime),
        multiplier: multiplier
      }
    }
    state.setroundsInformation(data);
  }

  const getRoundInformation = async (id: any = false) => {
    window.countdownTime = 300; // by default

    const crushGame = contracts.crushGame?.read;
    if (!crushGame) return;
    id ? state.setRoundID(Number(id)) : getRoundID();
    id && (window.activeRoundID = Number(id))

    id && getACurrentRoundBets(id)

    try {
      const round: Round = await crushGame.round();
      const { startTime, endTime, breakDuration, isActive, randomNumberHash, randomNumber, multiplier, } = round;

      setRoundInfo({ startTime, endTime, breakDuration, randomNumberHash, randomNumber, multiplier, isActive })
      setSOONToolTip(!isActive);

      setFirstDataLoaded(e => !e.done ? { loaded: true } : e)

      if (isActive) {
        const nowTime = new Date().getTime() / 1000;

        let left = (Number(endTime) + 2) - nowTime;
        window.endRoundTime = Number(endTime) + 2;

        if (left < 15) {
          setRoundIsGoing(true)
        }

        if (left >= 0) {
          window.countdownTime = left;
          setCountdownTimer(Number(left.toFixed()))
        } else {
          window.countdownTime = 1;
        }
        setAnimationTimer((e) => ({ ...e, play: true }));

      }
    } catch (error) {
      //  console.log("rounds error", error);
    }
  }

  // init contaracts events 
  useEffect(() => {
    const crushGameContract = contracts.crushGame?.read;
    const crappyCousinsContract = contracts.crappyCousins?.read;
    const crappyAchievementsContract = contracts.crappyAchievements?.read;

    let EndedID: any;
    let PlacedID: any;
    let StartedID: any;
    let LevelID: any;
    let NotifyID: any;

    const onBetPlaced = (id: any, user: string, bet: any) => {
      PlacedID && clearTimeout(PlacedID)
      PlacedID = setTimeout(async () => {
        const roundID = Number(id);
        consoleLog("==== Bet placed ====");
        const data = {
          amount: Number(ethers.formatEther(bet.amount)),
          multiplier: (Number(bet.multiplier) / 100).toFixed(2),
        }
        if (roundID == window.activeRoundID) {
          state.setRoundBets({ [user.toLowerCase()]: data });
        }

        checkIfMyAccount(user) &&
          state.setUserHistoryBets({ [roundID]: { ...data } })

      }, 50)
    }
    const onRoundStarted = (roundId: number) => {
      StartedID && clearTimeout(StartedID)
      StartedID = setTimeout(() => {
        consoleLog(`==== Started new ${roundId} round ====`)
        setNewRounStarted(roundId)
        if (window.round_done) {
          getRoundInformation(roundId);
          state.setRoundBets(false)

        }
      }, 50)
    }

    const onRoundEnded = (id: any, rn: any, multiplier: any, bd: any) => {
      EndedID && clearTimeout(EndedID)
      EndedID = setTimeout(() => {
        consoleLog(`==== RoundEnded id:${id} ====`)
        //  console.log("multiplier:", multiplier);
        //  console.log("breakDuration:", bd);
        const time = new Date().getTime();
        const mp = (Number(multiplier) / 100).toFixed(2);
        setRoundInfo(e => ({ ...e, multiplier }))
        setRoundIsGoing(false)
        setFlyRoundStarted({ started: true })
        setRoundMultiplier(mp)

        window.canPlayLotti = true;
        window.startedRoundTime = time;
        window.round_done = false;

      }, 50)

    }

    const onCrappyCousinLevelUp = (owner: string, level: any) => {
      LevelID && clearTimeout(LevelID)
      LevelID = setTimeout(() => {
        updateUserLeaderData(state, owner, REWARD_LevelOf, level)
        if (checkIfMyAccount(owner)) {
          state.setMyRewardsData({ "levelOf": Number(level) })
        }
      }, 50)
    }

    const CrappyAchievementsNotify = (user: string, rewardType: any, previousValue: any, newValue: any,) => {
      NotifyID && clearTimeout(NotifyID)
      NotifyID = setTimeout(() => {
        const type = Reward_Type[Number(rewardType)];
        // console.log(" ====== CrappyAchievementsNotify ====== ")
        // console.log(user.slice(-4), type, previousValue, newValue)
        updateUserLeaderData(state, user, type, newValue)
        if (checkIfMyAccount(user)) {
          state.setMyRewardsData({ [type]: newValue })
        }

      }, 50)


    }
    const CrappyAchievementsRewardAdded = (rewardIndex: any, reward: any) => {
      //  console.log("CrappyAchievementsRewardAdded", rewardIndex, reward)
    }

    const CrappyAchievementsRewardRedeemed = (rewardIndex: any, user: any) => {
      if (checkIfMyAccount(user)) {
        state.setMyRedeemedRewards([Number(rewardIndex)])
      }
    }

    if (crushGameContract) {

      crushGameContract.on('CrushGameBetPlaced', onBetPlaced);
      crushGameContract.on('CrushGameRoundStarted', onRoundStarted);
      crushGameContract.on('CrushGameRoundEnded', onRoundEnded);

      window.onRoundEnded = (id = 500) => onRoundEnded(roundID, null, id, 5)

      getRoundInformation()
      getGeneralSettings()
    }
    if (crappyAchievementsContract) {
      crappyAchievementsContract.on('CrappyAchievementsNotify', CrappyAchievementsNotify);
      // crappyAchievementsContract.on('CrappyAchievementsRewardAdded', CrappyAchievementsRewardAdded);
      crappyAchievementsContract.on('CrappyAchievementsRewardRedeemed', CrappyAchievementsRewardRedeemed);
    }

    if (crappyCousinsContract) {
      crappyCousinsContract.on('CrappyCousinsLevelUp', onCrappyCousinLevelUp);
    }

    return () => {
      if (crushGameContract) {
        crushGameContract.off('CrushGameBetPlaced', onBetPlaced);
        crushGameContract.off('CrushGameRoundStarted', onRoundStarted);
        crushGameContract.off('CrushGameRoundEnded', onRoundEnded);
      }

      if (crappyCousinsContract) {
        crappyCousinsContract.off('CrappyCousinsLevelUp', onCrappyCousinLevelUp);
      }
    }
  }, [contracts])

  // save round information on round ended and then clear data
  useEffect(() => {

    if (flyRoundStarted.ended) {
      window.countdownTime = 300; // by default
      isNewRounStarted ? getRoundInformation(isNewRounStarted) : setSOONToolTip(true);

      // Object.keys(roundBets).forEach(user => user && initUserLeaders(user.toLowerCase(), state))

      window.updateMyBalance?.()
      window.round_done = true;

      saveRoundInfo(roundInfo)
      state.setRoundBets(false)
      state.setFlyProgress(0);
      setFlyRoundStarted({ break: true })
    }

    return () => { }
  }, [flyRoundStarted.ended])


  useEffect(() => {
    if (isFirstDataLoaded.loaded) {
      setFirstDataLoaded({ done: true })
      const active = roundInfo.isActive;
      const s = state.getState();

      let lastID = roundsInformation.last_roundID;
      const allSavedRounds = Object.keys(roundsInformation.rounds).length
      const data = { ...roundsInformation };
      const saveNewID = roundID - (active ? 1 : 0)
      data.last_roundID = saveNewID;

      // console.log("lastID", lastID)
      // console.log("allSavedRounds", allSavedRounds)

      if (lastID > roundID || allSavedRounds < lastID) {
        data.rounds = {}
        lastID = 1;
      }

      const getData = async (type: string) => {
        // console.log(`getData ${type} to the round ${saveNewID}`)
        const betters = initRoundsBatch(type, lastID, s, saveNewID);
        for await (const better of betters) {
          const keys = Object.keys(better);
          keys.forEach((key) => {
            data.rounds[key] = { ...s.roundsInformation.rounds[key], ...better[key] }
          })
          state.setroundsInformation(data);
        }
      }

      active && getACurrentRoundBets(roundID)
      if (roundID <= 1 || lastID == saveNewID) return;
      // console.log("active roundID", roundID, saveNewID);
      // console.log("last saved roundID", lastID);
      getData('rounds');
      getData('betters');
    }

    return () => { }
  }, [isFirstDataLoaded.loaded])



  return (
    <AnimContext.Provider value={{
      flyRoundStarted,
      roundIsGoing,
      roundMultiplier,
      countdownTimer,
      showSOONToolTip,
      animationTimer,
      flightProgress,
      roundInfo,
      setFlyRoundStarted,
      setRoundIsGoing,
      setRoundMultiplier,
      setCountdownTimer,
      setSOONToolTip,
      setAnimationTimer,
      setFlightProgress,
    }}>
      {children}

      {showSOONToolTip !== null && showSOONToolTip && status.loaded && <Tooltip className="starting-soon" title='BETTING ROUND STARTING SOON!' />}

    </AnimContext.Provider>
  );
}

export default AnimContext;

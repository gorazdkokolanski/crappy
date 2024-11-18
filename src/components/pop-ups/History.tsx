import React, { useEffect, useState } from "react";
import { Store } from "../../types/state"
import Text from "../ShadowText";
import ScrollBarWrapper from "../ScrollBarWrapper";
import { RoundInfo, UserBet } from "../../types/types";
import { ethers } from "ethers";
import { saveUserBetData } from "../../utils/utils";

type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void

}

type RowProps = {
  id: string,
} & RoundInfo

const Row = ({ data, myBet }: { data: RowProps, myBet: UserBet }) => {
  const font = "font-24";
  const multiplier = data.info?.multiplier;
  const my_multiplier = Number(myBet?.multiplier);
  const isWon = multiplier >= my_multiplier;
  const count = data.betts?.length || "";
  const numberID = "#" + data.id;
  const coff = Math.min(my_multiplier, multiplier);
  const silver_count = isWon ? (coff * Number(myBet?.amount)).toFixed(2) : "0.00";
  // const gold_count = "0.00";

  return <>
    <div className="grid--row">
      <div className={"grid--row-block border-black-4 border-8" + (isWon ? "" : " lose")}>

        <div className="top flex">
          <Text className={font} text={"X" + multiplier} />
          <div className="flex v-center" >
            <div className="top--user flex icon-user"></div>
            <Text className={font} text={count} />
          </div>
        </div>

        <div className={"center border-black-4" + (isWon ? "" : " lose")}>
          <div className="flex v-center">
            <div className="center--coin icon-coin-silver-crappy" />
            <Text className={font} text={silver_count} />
          </div>
          {/* <div className="flex v-center">
            <div className="center--coin icon-coin-gold-crapps" />
            <Text className={font} text={gold_count} />
          </div> */}
        </div>
        <div className="top flex">
          {/* <Text className={font} text={time} /> */}
          <Text className={font} text={numberID} />
        </div>
      </div>
    </div>
  </>
}

const noDataTitle = "Start crapping if you want to see things here!";

export default function History({ isActive, cb, state }: Props) {
  const { web3: { account }, roundsInformation, contracts, userHistoryBets } = state.getState();

  const [active, setActive] = useState(false);
  const [myHistory, setMyHistory] = useState<RowProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isActive && setActive(isActive)
    return () => { }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["history"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  useEffect(() => {
    const { rounds } = roundsInformation;

    const lw = (a: string) => a.toLowerCase()

    const entries = Object.entries(rounds);
    const roundsWithBet = entries.filter(([, r]) => r.betts?.length && r.betts?.some(a => lw(a) == lw(account)));
    const maped = roundsWithBet.map(([id, details]) => ({ id, ...details })).reverse();

    if (myHistory.length == maped.length) return;

    setMyHistory(maped)

    // def batch ======== need like test

    // const fetchRounds = async (length, batchSize = 99) => {
    //   const data = {};
    //   for (let i = 0; i < length; i += batchSize) {
    //     const batch = Array.from({ length: Math.min(batchSize, length - i) });
    //     await Promise.all(
    //       batch.map(async (_, j) => {
    //         const id = i + j + 1;
    //         const ress = await contracts.crushGame?.read.rounds(id);
    //         data[id] = { ...ress, id };
    //       })
    //     );
    //     console.log("data", Object.keys(data).length)
    //   }
    //   // return data;
    // };
    return () => { }
  }, [account, roundsInformation])


  useEffect(() => {
    saveUserBetData(userHistoryBets, account)
    return () => { }
  }, [userHistoryBets])

  useEffect(() => {
    if (!active) return;

    const mySavedBets = userHistoryBets;

    const notSavedRounds = myHistory.filter(r => !(r.id in mySavedBets));


    const fetchMyPrevBet = async () => {
      // console.log("loading user history ...")
      if (notSavedRounds.length) {
        setLoading(true);
        await Promise.all(
          notSavedRounds.map(async (round) => {
            const ress = await contracts.crushGame?.read.bets(round.id, account);

            mySavedBets[round.id] = {
              amount: Number(ethers.formatEther(ress.amount)),
              multiplier: (Number(ress.multiplier) / 100).toFixed(2),
            }
          })
        );
      }
      state.setUserHistoryBets(mySavedBets)
      setTimeout(() => setLoading(false), 500)
    }
    fetchMyPrevBet()

    return () => {
    }
  }, [active, myHistory])


  if (!active) return;


  return <>
    <div className="popup-overflow history">
      <div className={`pop_up history hidden`}>
        <Text tag="button" className="pop_up--close close font-48" title="Close" text="X" onClick={() => cb()} />

        <div className="wrapper flex border-16 border-black-2">
          <Text className="font-48" text="history" />


          {loading ?

            <div className="flex flex-1 v-center h-center">
              <div className="flex v-center gap-12">
                <div className={`text-shadow icon-28 icon-loading`} />
                <Text className="font-28" text="Gathering flight history... almost ready!" upper={false} />
              </div>
            </div> :

            myHistory.length ?
              <div className="pop_up--overflow">
                <ScrollBarWrapper>
                  <div className="grid">
                    {myHistory.map((data) => <Row key={data.id} data={data} myBet={userHistoryBets[data.id]} />)}
                  </div>
                </ScrollBarWrapper>
              </div> :

              <div className="no-data flex flex-1 v-center flex-1">
                <Text upper={false} className="text-center font-24" text={noDataTitle} />
              </div>
          }
        </div>
      </div>
    </div>

  </>

}

import React, { useEffect, useRef, useState } from "react";
import { Store } from "../../types/state"
import Text from "../ShadowText";

import ScrollBarWrapper from "../ScrollBarWrapper";
import Button from "../Button";
import { Leader } from "../../types/types";
import UserAvatar from "../UserAvatar";
import { formatLargeNumber, initUserLeaders, REWARD_betsPlaced, REWARD_CrappsEarned, REWARD_CrappsSpent, REWARD_CrushWinnings, REWARD_highestMultiplier, REWARD_LevelOf, shortenAddress } from "../../utils/utils";
import { ethers } from "ethers";

type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}

type User = {
  address: string
  place?: number
} & Leader

type RowProps = {
  id: number,
  tab: "crappy" | "crapps",
  leader: User

}

type Sort = typeof REWARD_highestMultiplier | typeof REWARD_LevelOf

const tabs = [
  { key: "crappy", title: "Crappy" },
  { key: "crapps", title: "Crapps" },
]


const tableTABS = {
  crappy: [
    { row: "place", name: "#" },
    { row: "name", name: "Player" },
    { row: "won", name: "total won" },
    { row: "spent", name: "rounds played" },
    { row: "last", name: "multiplier" },
  ],
  crapps: [
    { row: "place", name: "#" },
    { row: "name", name: "Player" },
    { row: "won", name: "total won" },
    { row: "spent", name: "Total spent" },
    { row: "last", name: "Cousin" },
  ],
  coins: {
    crappy: "silver-crappy",
    crapps: "gold-crapps",
  }
}


const places = ["f", "s", "t"];


const Row = ({ id, tab, leader }: RowProps) => {
  const formatedCrapps = formatLargeNumber(leader[REWARD_CrappsEarned])
  const formatedSpent = formatLargeNumber(leader[REWARD_CrappsSpent])


  const name = shortenAddress(leader.address);
  const won = {
    crappy: ethers.formatEther(leader[REWARD_CrushWinnings]),
    crapps: `${formatedCrapps.number} ${formatedCrapps.unit}`,
  }
  const bets = Number(leader[REWARD_betsPlaced]);
  const spent = `${formatedSpent.number} ${formatedSpent.unit}`;
  const multiplier = (Number(leader[REWARD_highestMultiplier]) / 100).toFixed(2);
  const place = id - 1 < 3 ? places[id - 1] : "";
  const wrapperRef = useRef<HTMLDivElement>(null)
  const coin = tableTABS.coins[tab];

  // useEffect(() => {
  //   const wrapper = wrapperRef.current;

  //   if (wrapper) {
  //     const h = wrapper.clientHeight;
  //     const space = leader.place == 1 ? 0 : 15
  //     wrapper.style.top = h * (leader.place - 1) + space * (leader.place - 1) + "px"
  //   }
  //   // console.log("wrapperRef", wrapperRef.current?.offsetTop)

  //   return () => {

  //   }
  // }, [leader.place])


  return <>
    <div className="wrapper--grid-row" ref={wrapperRef}>
      <div className={"block border-black-4 border-16 flex font-16-bl " + place}>

        <div className="row row_place">
          <p className="">#{id}</p>
        </div>

        <div className="row row_name">

          <UserAvatar lvl={Number(leader[REWARD_LevelOf]) || 1} name=" icon-avatar" />
          {/* <div className="icon-avatar flex border-50 border-black-2 cover">
            <img src={user} alt="" />
          </div> */}
          <p>{name}</p>
        </div>
        <div className="row row_won">
          <div className={"icon-coin text-shadow icon-coin-" + coin} />
          <p>{won[tab]}</p>
        </div>
        <div className="row row_spent">
          {tab == "crappy" && <p>{bets}</p>}
          {tab == "crapps" && <>
            <div className={"icon-coin text-shadow icon-coin-" + coin} />
            <p>{spent}</p>
          </>}
        </div>
        {tab == "crappy"
          ? <div className="row row_last">
            <div className="row-stroke row">
              <p className="font-40">X{multiplier}</p>
            </div>
          </div>
          : <div className="row row_last">
            <div className="flex v-center column">
              <UserAvatar lvl={Number(leader[REWARD_LevelOf]) || 1} name=" icon-avatar" />
              <Text className="font-24 lvl" text={"lvl " + leader[REWARD_LevelOf]} />
            </div>


          </div>
        }
      </div>

    </div>
  </>
}

export default function Leaderboard({ isActive, cb, state }: Props) {
  const { leaderboard, roundsInformation } = state.getState()
  const [active, setActive] = useState(false);
  const [leadersArray, seaLeadersArray] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<"crappy" | "crapps">("crappy");
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);


  useEffect(() => {

    let sortBy: Sort = REWARD_highestMultiplier

    activeTab == "crapps" && (sortBy = REWARD_LevelOf);

    if (leaderboard == false) return;

    const entries = Object.entries(leaderboard).map(([address, details]) => ({ address, ...details }));

    // console.log("entries", entries)
    // const sortedUsers = [...entries]
    //   .sort((a, b) => {
    //     if (b[sortBy] == a[sortBy]) {
    //       return b.betsPlaced - a.betsPlaced;
    //     }
    //     return b[sortBy] - a[sortBy]

    //   })
    //   .map((user, index) => ({ ...user, place: index + 1 }));

    // const result = entries.map(user => {
    //   const place = sortedUsers.find(u => u.address == user.address)?.place || 0;
    //   return { ...user, place };
    // });


    let sortedUsersArray = entries
      .sort((a, b) => (b[sortBy] == a[sortBy]) ? b[REWARD_betsPlaced] - a[REWARD_betsPlaced] : b[sortBy] - a[sortBy]
      );
    sortedUsersArray.length && seaLeadersArray(sortedUsersArray)

    return () => { }
  }, [leaderboard, activeTab])

  // find all users who placed bets
  useEffect(() => {
    const uniqueUsers: Set<string> = new Set();
    Object.values(roundsInformation.rounds).filter(r => r.betts?.length).forEach(round => {
      round.betts?.forEach(bet => { uniqueUsers.add(bet.toLowerCase()) });
    });
    [...uniqueUsers].length ? setUniqueUsers([...uniqueUsers]) : state.setLeaderboard(false);
    return () => { }
  }, [roundsInformation])


  // fetch users info after opening popup  
  useEffect(() => {

    const loadLeaders = async () => {
      const data = uniqueUsers;
      if (data.length) {
        await Promise.all(data.map(user => initUserLeaders(user, state)));
      }
      loadingData && setTimeout(() => setLoadingData(false), 100)
    }
    isActive && loadLeaders()
    return () => { }
  }, [uniqueUsers.length, isActive])

  useEffect(() => {
    isActive && setActive(isActive)
    return () => { }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["leader"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])

  if (!active) return;
  return <>
    <div className="popup-overflow leader">

      <div className={`pop_up leader hidden`}>
        <Text tag="button" className="pop_up--close close font-48" title="Close" text="X" onClick={() => cb()} />

        <div className="wrapper flex border-16 border-black-2">
          <Text className="font-48" text="Leaderboard" />


          {
            Boolean(uniqueUsers.length) && <>
              <div className="wrapper--tabs flex w-full">
                {tabs.map((tab: any) =>
                  <Button key={tab.key} text={tab.title} buttonType="tab"
                    onClick={() => setActiveTab(tab.key)} font="20"
                    className={activeTab == tab.key ? " active" : ""}
                  />
                )}
              </div>
              <div className="wrapper--table flex upper w-full border-black-4 font-16-bl">
                {tableTABS[activeTab].map((row: any) => (
                  <div className={`wrapper--table-row row row_${row.row}`} key={row.name}>
                    <p >{row.name}</p>
                  </div>
                ))}
              </div>
            </>
          }




          {loadingData ?
            <div className="initing flex h-center v-center flex-1">
              <div className="flex v-center gap-12">
                <div className={`text-shadow icon-28 icon-loading`} />
                <Text className="font-28" text="We are looking for our leaders" upper={false} />
              </div>
            </div> :

            leaderboard ?
              <div className="pop_up--overflow">
                <ScrollBarWrapper>
                  <div className="wrapper--grid">
                    {leadersArray.map((data, index: number) => <Row tab={activeTab} key={data.address} id={index + 1} leader={data} />)}
                  </div>
                </ScrollBarWrapper>
              </div> :
              <div className="initing flex h-center v-center column flex-1 text-center">
                <Text className="font-32" text="The leaderboard is silent… for now." upper={false} />
                <br />
                <Text className="font-32" text="Be the first to rise and reign supreme!" upper={false} />
              </div>
          }

        </div>
      </div>
    </div>

  </>

}

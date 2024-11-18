import React, { useEffect, useState } from "react";
import { Store } from "../../types/state"
import Text from "../ShadowText";
import Button from "../Button";
import Birds from "./components/shop/Birds";
import Cousins from "./components/shop/Cousins";
import Tooltip from "../Tooltip";
import { getSkinsInfo } from "../../utils/utils-contracts";

type Props = {
  state: Store,
  isActive: boolean,
  cb: () => void
}

const tabs = [
  { key: "birds", title: "birds" },
  { key: "crappy", title: "crappy cousins" },
]




export default function Shop({ isActive, cb, state }: Props) {
  const { web3: { account }, opened_popup: { options }, minimumBets, myRewardsData } = state.getState();
  const [loading, setLoading] = useState(true);

  const locked = {
    title: `Shop will be unlocked once you crapped ${minimumBets} times`,
    subtitle: [`Play at least ${minimumBets} games, Crapster!`],
  }

  const [active, setActive] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [isLoked, setLocked] = useState(myRewardsData.betsPlaced < minimumBets || !account);



  const loadSkinsCost = async () => {
    await getSkinsInfo();
    setTimeout(() => setLoading(false), 1000)
  }

  useEffect(() => {
    setLocked(myRewardsData.betsPlaced < minimumBets || !account)
    return () => { }
  }, [myRewardsData.betsPlaced, account])

  useEffect(() => {
    if (isActive) {
      setActive(isActive)
      setActiveTab(options?.title || tabs[0].key);
      loading && loadSkinsCost()
    }
    return () => { }
  }, [isActive])

  useEffect(() => {
    window.closePopUp["shop"] = (b: boolean) => setActive(b)
    return () => { }
  }, [])



  if (!active) return;


  return <>
    <div className="popup-overflow bottom-sm">
      <div className={`pop_up shop hidden`}>
        <Text tag="button" className="pop_up--close close font-48" title="Close" text="X" onClick={() => cb()} />

        <div className={"wrapper flex border-16 border-black-2 mobive-allow-scroll " + (isLoked ? "locked" : "")}>
          <Text className="font-48" text="Shop" />

          <div className="wrapper--tabs flex w-full">
            {tabs.map(tab =>
              <Button key={tab.key} text={tab.title} buttonType="tab"
                onClick={() => setActiveTab(tab.key)} font="20"
                className={activeTab == tab.key ? " active" : ""}
              />
            )}
          </div>
          {
            (() => {
              switch (activeTab) {
                case tabs[0].key:
                  return <Birds state={state} loading={loading} />
                case tabs[1].key:
                  return <Cousins state={state} />
                default:
                  break;
              }
            })()
          }

          {isLoked && <Tooltip {...locked} sound={false} />}

        </div>


      </div>
    </div>
  </>

}

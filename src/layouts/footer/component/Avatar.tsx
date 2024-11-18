
import { useEffect } from "react";
import Text from "../../../components/ShadowText";
import UserAvatar from "../../../components/UserAvatar";
import { Store } from "../../../types/state";
import { crappsPerSecond } from "../../../utils/utils";
import avatar from "/img/temp_avatar.png";


type Props = {
  state: Store,
  account: any
}



export default function Avatar({ state, account }: Props) {
  const s = state.getState();
  const { myRewardsData } = s;
  const level = Number(myRewardsData.levelOf);
  const coinPerSec = crappsPerSecond(s);
  const isActive = account && level;


  return <>

    <div className="footer--avatar flex v-center">

      <div className={(isActive ? "" : " none")} >
        <UserAvatar lvl={level} temp={level ? null : "temp_avatar.png"} />
      </div>

      {isActive
        ? <>
          <div className="flex v-center pers">
            <Text className="font-28" text="+" />
            <div className="text-shadow icon-28 icon-coin-gold-crapps"></div>
            <Text text={coinPerSec + "/s"} upper={false} className="font-28" />
          </div>
        </>
        : <>
          <Text className="font-20 text-center" upper={false} text="Unlocks After 10 Games" />
        </>}
    </div >
  </>
}

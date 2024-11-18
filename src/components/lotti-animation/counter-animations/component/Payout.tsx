
import { useContext, useEffect, useRef, useState } from "react";
import Text from "../../../../components/ShadowText";

const titlePayout = "round payout";
import AnimContext from "../../../../layouts/AnimationProvider";

type Props = {
  roundBets: any,
  flyProgress: number,
}

export default function Payout({ roundBets, flyProgress }: Props) {
  const anim = useContext(AnimContext)
  const flyCount = anim?.roundMultiplier;

  const arrayBets = Object.entries(roundBets)
  const countAll = arrayBets.length || false
  const countWon = countAll ? arrayBets.filter((bet: any) => flyProgress >= bet?.[1]?.multiplier).length : "0"

  return <>
    <div className="animation-round animation-payout flex column v-center" data-orientation="true">
      <div className="time" >
        <Text text={"x" + flyCount} upper={false} />
      </div>
      <Text text={titlePayout} className="font-40" />

      {countAll && <div className="users-won flex v-center">
        <div className="user-icon flex icon-user text-shadow" ></div>
        <Text text={`${countWon}/${countAll} Won`} className="font-24" />
      </div>}
    </div>
  </>
}

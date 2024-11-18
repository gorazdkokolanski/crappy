import { useContext, useEffect, useRef, useState } from "react";
import Timer from "./component/Timer";
import History from "./component/History";
import Payout from "./component/Payout";

import { useSoundHook } from "../../../utils/hooks/useSoundHook";

import bgm2 from "/sounds/bgm2.mp3";
import bgm1 from "/sounds/bgm1.mp3";
import timerDef from "/sounds/timer_default.mp3";
import timerRed from "/sounds/timer_red.mp3";
import { Store } from "../../../types/state";
import AnimContext from "../../../layouts/AnimationProvider";


export default function RoundTimer(props: any) {
  const anim = useContext(AnimContext)
  const playData = anim.animationTimer;
  const { isSound: sound, roundBets, flyProgress } = (props.state as Store).getState()
  const playBetting = useSoundHook(bgm2, { loop: true });
  const playGame = useSoundHook(bgm1, { loop: true });
  const playDefault = useSoundHook(timerDef, { loop: true });
  const playRed = useSoundHook(timerRed, { loop: true });


  useEffect(() => {
    const { isRound, showPayout } = playData;

    // BACK SOUND
    // return;

    if (sound) {

      if (!showPayout) {
        playBetting.play();
        playGame.stop();
      }

      if (isRound && !showPayout) {
        playGame.play()
        playBetting.stop();
      }

      if (showPayout) {
        playGame.stop()
        playBetting.stop()
      }

    } else {
      playGame.stop()
      playBetting.stop()
    }

    return () => { }
  }, [playData, sound])


  

  return <>
    <Timer   {...{ ...props, playDefault, playRed, sound, roundBets }} />
    < History  {...props} />
    {playData?.showPayout && <Payout  {...{ ...props, roundBets, flyProgress }} />}
  </>
}

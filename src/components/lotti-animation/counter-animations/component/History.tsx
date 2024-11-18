
import { useContext, useEffect, useRef, useState } from "react";
import Text from "../../../../components/ShadowText";
import { Store } from "../../../../types/state";
import AnimContext from "../../../../layouts/AnimationProvider";
import { consoleLog, goToBaseScan } from "../../../../utils/utils";

type Props = {
  state: Store,
}
type Histoty = {
  roundID: string,
  multiplier: string,
}

const AnimatedItem = ({ multiplier, roundID }: any) => {
  return (
    <div className="animation-history--row row border-black-2 border-4 pointer" title={"Round " + roundID} onClick={goToBaseScan}>
      <Text text={"x" + multiplier} />
    </div >
  );
};

export default function History({ state }: Props) {
  const anim = useContext(AnimContext)
  const flyCount: any = anim?.roundMultiplier;
  const [lastHistory, setLastHistory] = useState<Histoty[]>([])

  const play = anim.animationTimer;
  const setPlayTimer: any = anim.setAnimationTimer;
  const started: any = anim.flyRoundStarted.started;
  const [loading, setLoaded] = useState("loading")

  const runningTime = anim.flightProgress;
  const setRunningTime = anim.setFlightProgress;
  const roundInfo = anim.roundInfo;
  const runRef = useRef<HTMLDivElement>(null);
  const { roundsInformation, roundID, settings } = state.getState()

  useEffect(() => {
    if (!play.isRound) return;
    let step = 0.01;
    const interval = 10;
    const random = flyCount;
    let startTime: any = null;
    let intervalId: any = null;

    const initialDelaySeconds = settings.minBreakDuration + 1;
    const totalAnimationTime = initialDelaySeconds + (random - 1); // Загальний час анімації

    function onUpdate(pr: number) {
      const progress: any = pr.toFixed(2);
      state.setFlyProgress(progress)
      setRunningTime((e: any) => ({ ...e, progress }))
    }
    function onComplete() {
      state.setFlyProgress(flyCount)
      window["flyProgress"] = flyCount;
      setRunningTime((e: any) => ({ ...e, isDone: true }))

      if (!window['round_done']) {
        document.hidden
          ? setPlayTimer((e: any) => ({ ...e, showPayout: true }))
          :
          setTimeout(() => {
            setPlayTimer((e: any) => ({ ...e, showPayout: true }))
          }, 1000)

      }

    }
    const animate = () => {
      const now = Date.now();
      if (startTime === null) {
        startTime = now;
      }

      const elapsed = (now - startTime) / 1000;
      let newValue;

      if (elapsed <= initialDelaySeconds) {
        // Slow progress for the first ==>minBreakDuration<== seconds
        newValue = Math.min(1, (elapsed / initialDelaySeconds));
      } else {
        // The linear part of the animation
        const linearElapsed = elapsed - initialDelaySeconds;
        const remainingLinearTime = totalAnimationTime - initialDelaySeconds;
        newValue = Math.min(random, 1 + ((random - 1) * (linearElapsed / remainingLinearTime)));
      }

      onUpdate(newValue)
      if (newValue >= random) {
        onComplete()
        clearInterval(intervalId);
      }
    };

    if (random == 0) {
      setTimeout(onComplete, 1000);
      return;
    }

    intervalId = setInterval(animate, interval);
    return () => { }
  }, [play.isRound])


  useEffect(() => {
    const last_history = Object.entries(roundsInformation.rounds).reverse().slice(0, 300);
    const newArray = last_history.map(([roundID, ress]) => ({ roundID, multiplier: ress.info?.multiplier || null }));
    loading && newArray.length > 1 && setLoaded("");
    newArray.length > 1 && setLastHistory(newArray);
    return () => { }
  }, [roundsInformation])


  const getStyle: any = () => {
    let progress: any = Number(runningTime.progress) / 10
    progress = progress.toFixed(3);
    progress >= 1 && (progress = 1)
    return { "--coff": progress }
  }


  return <>
    <div className={`animation-history flex column ${loading}`} data-orientation="true">
      <div className="playing" ref={runRef}>
        {started && runningTime.progress !== false && <div
          style={getStyle()}
          className={"animation-history--row row border-black-2 border-4 active" + (!play.showPayout ? " bigger" : " none")}
          title={"Round " + roundID}
        >
          <Text text={"x" + runningTime.progress} />
        </div>}
      </div>

      {Boolean(lastHistory.length) && lastHistory.map((value) => (
        value.multiplier && <AnimatedItem key={value.roundID}  {...value} />
        //  !(value.roundID == roundID && roundInfo.isActive) && <AnimatedItem key={value.roundID}  {...value} />
      ))}
    </div >
  </>
}

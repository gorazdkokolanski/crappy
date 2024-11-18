

import { useContext, useEffect, useRef, useState } from 'react';

import lottie, { AnimationItem } from 'lottie-web';
import crash from "/sounds/crash.mp3";
import { Store } from '../../../../types/state';
import { useSoundHook } from '../../../../utils/hooks/useSoundHook';
import AnimContext from '../../../../layouts/AnimationProvider';


type Props = {
  state: Store,
  data: any,
  bird: any,
  active: boolean,
  setPause: (b: boolean) => void,
}

const CrappyHit = ({ data, active, bird, setPause, state }: Props) => {
  const { web3: { account }, roundBets } = state.getState();
  const anim = useContext(AnimContext)
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();
  const { play } = useSoundHook(crash);
  const setPlayTimer: any = anim.setAnimationTimer
  const roundFly = anim.setFlyRoundStarted
  const setRunningTime = anim.setFlightProgress;


  useEffect(() => {
    if (lottieContainerRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: 'canvas',
        loop: false,
        autoplay: false,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        },
        animationData: data,
      });
      const anim = animationRef.current;
      anim.play();

      const playOnce = () => {
        setTimeout(() => { anim.goToAndStop(0, true) }, 1100)
        anim.removeEventListener("complete", playOnce)
      }
      anim.addEventListener("complete", playOnce)

      return () => {
        animationRef.current?.destroy();
      };
    }
  }, [data]);

  useEffect(() => {

    if (!active) return;

    const dur = animationRef.current?.getDuration() as number;
    const birds = bird.current as HTMLDivElement;

    const handleComplete = () => {
      birds.removeAttribute("style");
      setPause(false)
      roundFly({ ended: true })
      setPlayTimer((e: any) => ({ ...e, isRound: false, play: false, showPayout: false, playIdle: true }))
      setRunningTime({ progress: false, isDone: false });
      roundBets[account?.toLowerCase()] && state.setPopUp("won");
      setTimeout(() => { animationRef.current?.stop(); }, 100)
    };

    animationRef.current?.play();
    play();
    setTimeout(handleComplete, (dur + 1) * 1000)
    return () => {
    }
  }, [active])




  return <>
    <div className={'bird flex hit' + (active ? " active" : "")}  >
      <div ref={lottieContainerRef} className='svg-wrapper' />
    </div>
  </>
}

export default CrappyHit;
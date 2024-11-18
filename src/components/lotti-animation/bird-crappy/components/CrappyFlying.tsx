

import { useContext, useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import wingsFlap from "/sounds/wings_flap.mp3";
import { useSoundHook } from '../../../../utils/hooks/useSoundHook';
import AnimContext from '../../../../layouts/AnimationProvider';

type Props = {
  data: any,
  progress: any,
  setType: (t: string) => void,
  active: boolean,
  sound: boolean,
}
// background
const CrappyFlying = ({ data, setType, active }: Props) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();
  const audioRef = useSoundHook(wingsFlap, { loop: true });
  const anim = useContext(AnimContext)
  const isDone = anim.flightProgress.isDone
  const time = anim.animationTimer
  const setTimer: any = anim.setAnimationTimer


  useEffect(() => {
    if (!isDone) return;
    const animation = animationRef.current;
    const isVisible = document.visibilityState == "visible";


    const handleComplete = () => {
      setType("falling");
      setTimeout(() => animationRef.current?.stop(), 100)
      audioRef?.stop()
      isVisible && animationRef.current?.removeEventListener('loopComplete', handleComplete);
    };

    if (isVisible) {
      animationRef.current?.addEventListener('loopComplete', handleComplete);
    } else {
      handleComplete()
    }
    return () => {
    }
  }, [isDone])



  useEffect(() => {
    if (lottieContainerRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: 'canvas',
        loop: true,
        autoplay: false,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        },
        animationData: data,
      });
      animationRef.current.setSpeed(1.2)
      time.isRound && active && animationRef.current.play()
    }

    return () => {
      animationRef.current?.destroy();
    };
  }, [data]);

  useEffect(() => {

    if (!active) return;
    audioRef.play()
    animationRef.current?.play();
    setTimer((e: any) => ({ ...e, isRound: true }))

    return () => { }
  }, [active])

  return (
    <>
      <div className={'bird flex flying' + (active ? " active" : "")} >
        <div ref={lottieContainerRef} className='svg-wrapper' />
      </div>
    </>
  )
}

export default CrappyFlying;
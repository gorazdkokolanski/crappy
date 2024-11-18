
import Lottie, { LottieProps, Options } from 'react-lottie';
import { Progress } from "../../Lotti";

import { useEffect, useRef, useState } from 'react';

import lottie, { AnimationItem } from 'lottie-web';


type Props = {
  data: any,
  bird: any,
  active: boolean,
}

const Trail = ({ data }: Props) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();

  useEffect(() => {
    if (lottieContainerRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        },
        animationData: data,
      });
      animationRef.current.setSpeed(0.8)
      return () => {
        animationRef.current?.destroy();
      };
    }
  }, []);


  return <>
    <div className={'trail flex '}  >
      <div ref={lottieContainerRef} className='svg-wrapper' />
    </div>
  </>
}

export default Trail;
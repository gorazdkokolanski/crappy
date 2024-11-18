

import { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { Store } from '../../../../types/state';
import { useSoundHook } from '../../../../utils/hooks/useSoundHook';
import collect from "/sounds/crapps_collect.mp3";
import { Leader } from '../../../../types/types';

type Props = {
  showRain: boolean,
  path: string,
  myRewardsData: Leader,
}

const animData = { fall: [70, 490] }

// background
const Cousin = (props: Props) => {
  const { showRain, path, myRewardsData } = props;
  const [cousinData, setCousinData] = useState(null)
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();
  const playCollect = useSoundHook(collect);


  useEffect(() => {
    let isPlaying = false;

    if (lottieContainerRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        },
        animationData: cousinData,
      });
      animationRef.current.setSpeed(1.5)
      animationRef.current.goToAndStop(220, true)
      animationRef.current.addEventListener("drawnFrame", (e) => {
        const frame = Number(e.currentTime.toFixed())
        if (!isPlaying) {
          if (animData.fall.some(fl => fl == frame)) {
            playCollect.play()
            isPlaying = true;
            setTimeout(() => (isPlaying = false), 500)
          }
        }
      })

    }
    return () => {
      animationRef.current?.removeEventListener("drawnFrame")
      animationRef.current?.destroy();
    };
  }, [cousinData]);

  useEffect(() => {
    const fetchAnimationData = async () => {
      const base = path + "lotti/cousins/crappy_cousin_lv" + myRewardsData.levelOf;
      try {
        const responses = await fetch(`${base}.json`);
        const data = await responses.json();
        setCousinData(data);
      } catch (error) {
      }
    };
    fetchAnimationData();
    return () => { }
  }, [myRewardsData.levelOf])

  useEffect(() => {

    const anim = animationRef.current

    showRain
      ? anim?.play()
      : setTimeout(() => anim?.pause(), 300);

    return () => {
    }
  }, [showRain])

  return <>
    <div className="cousin-wrapper" ref={lottieContainerRef}></div>
  </>
}

export default Cousin;
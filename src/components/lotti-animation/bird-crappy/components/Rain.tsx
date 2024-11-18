

import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

type Props = {
  playFalling: any,
  delay: number,
  showRain: boolean,
  rainData: any,
}

const animData = { fall: 28, }
// background
const Rain = ({ rainData, showRain, playFalling, delay }: Props) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();

  useEffect(() => {
    let isPlaying = false;

    if (lottieContainerRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "canvas",
        loop: true,
        autoplay: false,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        },
        animationData: rainData,
      });
      animationRef.current.setSpeed(1.5)
      animationRef.current.addEventListener("drawnFrame", (e) => {
        const frame = Number(e.currentTime.toFixed())
        if (!isPlaying) {
          if (animData.fall == frame) {
            playFalling.play()
            isPlaying = true;
            setTimeout(() => (isPlaying = false), 500)
          }
        }
      })

    }
    return () => {
      animationRef.current?.destroy();
    };
  }, []);

  useEffect(() => {

    const anim = animationRef.current

    showRain
      ? document.hidden
        ? anim?.goToAndPlay((delay / 1000) * 60, true)
        : setTimeout(() => anim?.play(), delay)
      : setTimeout(() => anim?.goToAndStop(0, true), 300);

    return () => {
    }
  }, [showRain])

  return <>
    <div className="rain" ref={lottieContainerRef}></div>
  </>
}

export default Rain;
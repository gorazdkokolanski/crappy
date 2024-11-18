

import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import fall from "/sounds/fall.mp3";
import { useSoundHook } from '../../../../utils/hooks/useSoundHook';


type Props = {
  sound: boolean,
  data: any,
  setType: (t: string) => void,
  active: boolean,
  bird: any,
}
// background
const CrappyFalling = ({ data, setType, active, bird, sound }: Props) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();
  const audioRef = useSoundHook(fall);


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
      animationRef.current.setSpeed(0.6)
    }
    return () => {
      animationRef.current?.destroy();
    };
  }, [data]);

  useEffect(() => {

    if (!active) return;
    // const anim = animationRef.current;
    const birds = bird.current as HTMLDivElement;
    const dur = animationRef.current?.getDuration() as number;
    birds.classList.remove("show-trail");

    const handleComplete = () => {

      setTimeout(() => {
        setType("hit");
        setTimeout(() => animationRef.current?.stop(), 200)
        // audio.stop();
        audioRef.stop()
      }, 800)
    };
    // play()
    audioRef.play()
    animationRef.current?.play();
    setTimeout(handleComplete, dur * 1000)
    return () => { }
  }, [active])

  return (
    <>
      <div className={'bird flex falling' + (active ? " active" : "")} >
        <div ref={lottieContainerRef} className='svg-wrapper' />
      </div>
    </>
  )

}

export default CrappyFalling;
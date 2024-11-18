
import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

type Props = {
  data: any,
  start: boolean,
  active: boolean,
  setType: (t: string) => void,
}
// background
const CrappyStart = ({ data, setType, start, active }: Props) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();

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
    }
    return () => {
      animationRef.current?.destroy();
    };
  }, [data]);

  useEffect(() => {

    if (!active) return;
    // const anim = animationRef.current;

    const handleComplete = () => {
      setType("flying")
      setTimeout(() => animationRef.current?.stop(), 100)
      // anim?.removeEventListener('complete', handleComplete);
    };

    if (start) {
      const dur = animationRef.current?.getDuration() as number;
      animationRef.current?.play();
      setTimeout(handleComplete, dur * 1000)
      // start && anim?.addEventListener('complete', handleComplete);
    }

    return () => { }
  }, [active, start])

  return <>
    <div className={'bird flex start' + (active ? " active" : "")} >
      <div ref={lottieContainerRef} className='svg-wrapper' />
    </div>
  </>
}








export default CrappyStart;
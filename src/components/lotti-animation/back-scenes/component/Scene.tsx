
import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';


const InitScene = ({ data, name, isPaused, lottieRef, landscape }: any) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();
  useEffect(() => {

    setTimeout(() => {
      if (lottieContainerRef.current) {
        animationRef.current = lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer: 'canvas',
          loop: true,
          autoplay: true,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
          },
          animationData: data,
        });

        lottieRef.current[name] = animationRef.current;
      };
    }, 10)

    return () => {
      animationRef.current?.destroy();
    }
  }, [landscape]);


  useEffect(() => {
    const anim = animationRef.current;
    isPaused[name] ? anim?.pause() : anim?.play()

    return () => { }
  }, [isPaused])



  return (
    <div className={'scene flex w-full ' + name}  >
      <div ref={lottieContainerRef} className='scene-wrapper' />
    </div>
  )
}

export default InitScene;
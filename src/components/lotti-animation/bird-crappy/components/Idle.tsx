
import { useContext, useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

import frog from "/sounds/frog.mp3";
import jump from "/sounds/crappy_jump.mp3";
import { useSoundHook } from '../../../../utils/hooks/useSoundHook';
import AnimContext from "../../../../layouts/AnimationProvider";

type Props = {
  data: any,
  bird: any,
  setStart: (t: boolean) => void,
  crappyType: (t: string) => void,
  setPause: (t: boolean) => void,
}

const animData = {
  time: 20,
  hideTime: 13.6,
  frames: 1200,
  // toCenter: 7.62,
  fromCenter: 6,
  checkRestart: 460,
  crappyHide: 820,
  pepeUp: 820,
  cubEnd: 915,
  pepeEnd: 950,
  jump: [290, 715],
}

let lastFrame = 0;

// background
const IdleJumping = ({ data, setStart, crappyType, bird, setPause }: Props) => {
  const anim = useContext(AnimContext)

  const time = anim.animationTimer
  const isDone = anim.flightProgress.isDone
  const setTimer: any = anim.setAnimationTimer
  const idleRef = useRef<HTMLDivElement>(null)
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();
  const [showPepe, setShowPepe] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const playJump = useSoundHook(jump);
  const playFrog = useSoundHook(frog);

  useEffect(() => {
    if (lottieContainerRef.current) {

      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: 'svg',
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
    if (!time.playIdle) return;

    // return
    gsap.ticker.lagSmoothing(false);

    // const anim = animationRef.current;
    const worker = new Worker(new URL('../../../web-worker/worker-idle.ts', import.meta.url));

    let timeProgress = lastFrame;
    let speedCoff = 1.1;
    let goToStartPoss = false;
    // let hideAnimation: any;
    let countdown = window.countdownTime;
    let isPlaying = false;

    animationRef.current?.goToAndStop(0, true);

    if ((countdown < animData.hideTime) && window.canPlayLotti) {
      timeProgress = (countdown > 3 ? (animData.crappyHide / 60 + 3) : animData.time) - countdown;
      idleRef.current?.removeAttribute("style")
    } else {
      gsap.set(idleRef.current, { x: "-45vw" })
      gsap.set(idleRef.current, { x: "0vw", transition: "4s linear" })
    }

    const toStart = () => {
      window.canPlayLotti = false;
      gsap.set(idleRef.current, { x: "-52.4vw", transition: "1.5s linear" })
    }

    const onmessage = (e: any) => {
      timeProgress = Number((timeProgress + (e.data * speedCoff)).toFixed(5));
      const progress = timeProgress / animData.time
      const time = progress * animData.frames;
      const frame = Number(time.toFixed());

      !document.hidden && animationRef.current?.goToAndStop(time, true);

      // check jump sound
      if (animData.jump.some(el => el == frame)) {

        if (!isPlaying) {
          playJump.play()
          isPlaying = true;
          setTimeout(() => {
            isPlaying = false;
          }, 1000)
        }
      }

      if (window.canPlayLotti) {
        if (frame < 660) {
          timeProgress = 680 / 60
        }
      } else {
        if (frame > 100 && (window.countdownTime < 0.5 || window.countdownTime == 0)) {
          if (frame > animData.checkRestart || frame < animData.jump[0]) {
            if (frame == 650 || frame < animData.jump[0]) {
              timeProgress = (animData.checkRestart + 20) / 60;
            }
          }
        } else {
          if (frame == animData.checkRestart) timeProgress = 0;
        }
      }

      if (frame >= 700) {
        !goToStartPoss && toStart()
        goToStartPoss = true;
      }

      if (frame == animData.crappyHide || progress >= 1) {
        setShowPepe(true)
        setTimer((e: any) => ({ ...e, playIdle: false }))
        worker.terminate();
        setTimeout(() => {
          lastFrame = 0;
        }, 1000);

      }
    }

    // setTimeout(() => {
    worker.onmessage = onmessage
    worker.postMessage({ interval: 10 });
    // }, 500);

    return () => {
      lastFrame = timeProgress
      worker.terminate();
    }
  }, [time.playIdle])



  useEffect(() => {

    if (!showPepe) return;



    const lottiAnim = animationRef.current;
    const wrapper = idleRef.current as HTMLDivElement;
    const elem = wrapper?.querySelector("svg #RED") as HTMLDivElement;
    const birds = bird.current as HTMLDivElement;
    const worker = new Worker(new URL('../../../web-worker/worker-idle.ts', import.meta.url));
    let startFly = false;
    let timeProgress = animData.pepeUp / 60;
    let speedCoff = 0.6;
    gsap.ticker.lagSmoothing(false);

    if (document.hidden) {
      gsap.set(idleRef.current, { x: "-52.4vw" })
    }

    const goPepeToStartPosition = () => {
      setStart(false);
      worker.terminate();
      setTimeout(() => setShowPepe(false), 2000)
      gsap.set(idleRef.current, { x: "-80vw" })

    }

    const handleEnterFrame = (f: any, isEnd: boolean) => {
      const fr = f - animData.pepeUp

      const poss = elem.getBoundingClientRect();

      birds.style.left = poss.x + birds.clientWidth * -0.25 + "px";
      birds.style.top = poss.y + birds.clientWidth * -0.4 + "px";

      !isFlying && setIsFlying(isEnd);

      if (fr >= 10) {
        setStart(true)

        if (!startFly) {
          setTimeout(() => {
            birds.style.opacity = "1"
            playFrog.play()
          }, 850)
          birds.classList.add("show-trail");

        }
        startFly = true;
      }
    };

    const handleComplete = () => {
      goPepeToStartPosition()
    };


    const onmessage = (e: any) => {
      timeProgress = Number((timeProgress + (e.data * speedCoff)).toFixed(5));
      const progress = timeProgress / animData.time
      const time = progress * animData.frames;
      const frame = Number(time.toFixed());
      lottiAnim?.goToAndStop(time, true);

      if (frame <= animData.cubEnd) {
        handleEnterFrame(time, frame == animData.cubEnd)
      }

      if (frame >= animData.pepeEnd) {
        handleComplete()
      }
    }

    worker.onmessage = onmessage
    worker.postMessage({ interval: 10 });

    crappyType("start");
    setPause(true);

    return () => {
      worker.terminate();
    };

  }, [showPepe]);

  useEffect(() => {

    if (!isFlying) return;
    const birds = bird.current as HTMLDivElement;
    const header = document.querySelector("header") as HTMLDivElement;

    const h = window["scene-height"];
    const headerH = header.clientHeight;
    setPause(false);
    gsap.ticker.lagSmoothing(false);
    const timeline = gsap.timeline();

    timeline.to(birds, {
      duration: 20,
      left: "50vw",
      top: `${((headerH + birds.clientHeight / 2) * 100) / window.innerHeight}%`,
      ease: "power3.out",
    },)

    return () => {
      // playFrog()
      // audioFrog?.stop()
      // audioFrog?.pause()
      playFrog.stop()
      timeline.kill();
    }
  }, [isFlying])

  useEffect(() => {

    if (!isDone) return;
    gsap.ticker.lagSmoothing(false);

    setIsFlying(false);
    const birds = bird.current as HTMLDivElement;
    const timeline = gsap.timeline();
    const h = window["scene-height"];

    timeline.fromTo(birds, {
      y: 0,
    }, {
      delay: 1.1,
      duration: 1,
      top: 100 + "%",
      y: birds.clientHeight * -0.6,
      ease: "none",
    })

    setPause(true)

    return () => {
      isDone && timeline.kill()
    }
  }, [isDone])


  return <>
    <div className={'lotti-animation-idle flex column'} ref={idleRef}>
      <div ref={lottieContainerRef} className='svg-wrapper' />
    </div>
  </>
}

export default IdleJumping;
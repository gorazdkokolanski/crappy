import { useContext, useEffect, useRef, useState } from 'react';
import InitScene from "./component/Scene";
import { Store } from "../../../types/state";
import amb1 from "/sounds/amb1.mp3";
import amb2 from "/sounds/amb2.mp3";
import amb3 from "/sounds/amb3.mp3";
import { useSoundHook } from "../../../utils/hooks/useSoundHook";
import AnimContext from "../../../layouts/AnimationProvider";


type AllLotti = {
  bottom: boolean, center: boolean, top: boolean,
}
type Props = {
  state: Store,
  pause: boolean | null,
}
const classes = ["bottom", "center", "top"]
const urls = ['scene-1', 'scene-2', 'scene-3'];

const Scenes = ({ state, pause }: Props) => {
  const animContext = useContext(AnimContext)
  const [animationData, setAnimationData] = useState<any[]>([]);
  const [scene, setScene] = useState<boolean | number>(false);

  const { isSound: sound, basePath, isLandscape } = state.getState();

  const [isLottiPaused, setIsLottiPaused] = useState<AllLotti>({ bottom: false, center: true, top: true, })
  const lottieRef = useRef<any>({});
  const animation = useRef<any>();
  const scenesRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>();
  const rainRef = useRef<HTMLDivElement>();

  const playScene1 = useSoundHook(amb1, { loop: true });
  const playScene2 = useSoundHook(amb2, { loop: true });
  const playScene3 = useSoundHook(amb3, { loop: true });


  const changePlayScene = (key?: string, b: number | boolean = 0) => {
    if (key) {
      setIsLottiPaused((e) => ({ ...e, [key]: Boolean(b) }))
    } else {
      setIsLottiPaused(() => ({ bottom: false, center: true, top: true, }))
    }
  }

  useEffect(() => {
    const fetchAnimationData = async () => {
      const base = basePath + "lotti/";
      try {
        const responses = await Promise.all(urls.map(url => fetch(`${base + url}.json`)));
        const data = await Promise.all(responses.map(r => r.json()));
        setAnimationData(data.map((data: any, i: number) => ({ data, name: classes[i] })));
        state.setLoading({ scenes: false })
      } catch (error) {
      }
    };
    !animationData?.length && fetchAnimationData();
    return () => { }
  }, [])

  useEffect(() => {
    if (scene == false) return;
    const wrapper = scenesRef.current as HTMLDivElement;
    const options = (y: number, d: number) => ({
      yPercent: y,
      duration: d,
      // ease: "none", backgroundColor: c
    })
    gsap.ticker.lagSmoothing(false);

    if (!rainRef.current) {
      rainRef.current = document.querySelector(".lotti-animation-gold .svg-wrapper") as HTMLDivElement;
    }

    let anim: any = gsap.timeline();

    if (scene == 1) {
      changePlayScene("bottom")
      anim.to(wrapper, { ...options(20, 20) })
    }
    if (scene == 2) {
      changePlayScene("center");
      anim.to(wrapper, {
        ...options(33.33, 1.5), onComplete: () => {
          playScene1.stop()
          changePlayScene("bottom", 1)
        }
      }, "start")
      anim.to(wrapper, { ...options(43, 14) }, "end");
      gsap.to(rainRef.current, {
        bottom: "auto",
        top: "0%",
        duration: 3,
        // transition: "3s linear",
      })
    }
    if (scene == 3) {
      setTimeout(() => changePlayScene("top"), 1000)
      anim.to(wrapper, {
        ...options(66.66, 1.5), onComplete: () => {
          playScene2.stop()
          changePlayScene("center", 1)
        }
      }, "start")
      anim.to(wrapper, { ...options(70, 14) }, "end");
    }
    animation.current = anim;

    return () => {
      anim?.kill()
    }
  }, [scene])

  useEffect(() => {

    if (sound) {
      scene == 1 && playScene1.play()
      scene == 2 && playScene2.play()
      scene == 3 && playScene3.play()
    } else {
      playScene1.stop()
      playScene2.stop()
      playScene3.stop()
    }

    return () => { }
  }, [sound, scene])


  useEffect(() => {

    if (pause == null) return;

    if (!footerRef.current) {
      footerRef.current = document.querySelector("footer") as HTMLDivElement
    }

    footerRef.current.classList.toggle("paused", pause)

    let p = gsap.to([], {
      duration: pause ? 0.5 : 1, onUpdate() {
        const pr = (pause ? (1 - p.progress()) : p.progress())
        lottieRef.current.bottom.setSpeed(pr);
      }
    })

    return () => {
      p.kill()
    }
  }, [pause])



  useEffect(() => {
    const { isDone, progress } = animContext.flightProgress;
    if (!progress) return;
    gsap.ticker.lagSmoothing(false);

    const pr = Number(progress);
    const rain = rainRef.current;
    const stageNum = pr <= 3 ? 1 : pr < 10 ? 2 : 3
    setScene(stageNum)

    if (isDone) {
      const wrapper = scenesRef.current as HTMLDivElement;
      setScene(false)
      animation.current?.kill();
      gsap.to(wrapper, {
        delay: 1,
        yPercent: 0,
        duration: 1,
        ease: "none",
        // backgroundColor: "#415af5"
      }).then(() => {
        changePlayScene()
        wrapper.removeAttribute("style")
        rain && rain.removeAttribute("style")
        lottieRef.current?.center?.stop()
        lottieRef.current?.top?.stop()
        playScene1.stop()
        playScene2.stop()
        playScene3.stop()
      })
      rain && gsap.to(rain, {
        bottom: "0%",
        delay: 1,
        top: "auto",
        duration: 1,
        // transition: "1s linear",
      }).then(() => {
        rain && rain.removeAttribute("style")
      })
    }

    return () => {
    }
  }, [animContext.flightProgress])



  return <>
    <div className="lotti-animation-scenes--wrapper flex w-full">

      <div className={"lotti-animation-scenes flex w-full"} ref={scenesRef}>

        {animationData?.length ?
          animationData.map((data: any, id) => (
            <InitScene key={id} {...data} isPaused={isLottiPaused} lottieRef={lottieRef} landscape={isLandscape} />
          )) : <>
            <div className='scene flex w-full'><div></div></div>
            <div className='scene flex w-full'><div></div></div>
            <div className='scene flex w-full'><div></div></div></>}
      </div >
    </div>
  </>
}

export default Scenes;
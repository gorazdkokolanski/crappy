

import React, { useEffect, useRef, useState } from 'react';
import CrappyFalling from './components/CrappyFalling';
import CrappyFlying from './components/CrappyFlying';
import CrappyHit from './components/CrappyHit';
import CrappyStart from './components/CrappyStart';
import Trail from "./components/Trail";
import { Store } from "../../../types/state";
import IdleJumping from "./components/Idle";
import GoldCousin from "./components/GoldCousin";


type Props = {
  state: Store,
  setPause: any,
}

const crappyStages: any = {
  "trail": Trail,
  "falling": CrappyFalling,
  "flying": CrappyFlying,
  "hit": CrappyHit,
  "start": CrappyStart,
}


// background
const Crappy = (props: Props) => {
  const { state } = props;
  const { isSound, birdSkin, basePath } = state.getState();
  const [activeSkin, setSkin] = useState("")
  const [animationData, setAnimationData] = useState<any>(null);
  const birdsRef = useRef<HTMLDivElement>(null);
  const [activeCrappyType, setCrappyType] = useState("");
  const [startCrappyFly, setStartCrappyFly] = useState(false);
  const [loadedData, setLoadedData] = useState<any>({})


  useEffect(() => {

    // if (!account && birdSkin !== "base") {
    //   state.setBirdSkin("base")
    //   return;
    // }

    if (activeSkin == birdSkin) return;
    const urls = [...(birdSkin == "base" ? [] : ['trail']), 'falling', 'flying', 'hit', 'start', 'jumping'];

    const base = basePath + `lotti/crappy/${birdSkin}/`;
    const isLoded = loadedData[birdSkin];

    const fetchAnimationData = async () => {
      try {
        const responses = await Promise.all(urls.map(url => fetch(`${base}bird-${url}.json`)));
        const data = await Promise.all(responses.map(r => r.json()));
        const obg: any = {};
        data.forEach((d, i) => { obg[urls[i]] = d })
        setAnimationData(obg);
        setLoadedData((e: any) => ({ ...e, [birdSkin]: obg }))
        state.setLoading({ heroes: false })

      } catch (error) {
      }
    };
    isLoded ? setAnimationData(isLoded) : fetchAnimationData();
    setSkin(birdSkin)

    return () => {

    }
  }, [birdSkin])



  return <>
    {animationData ? <>

      <IdleJumping
        data={animationData.jumping}
        bird={birdsRef}
        setStart={setStartCrappyFly}
        crappyType={setCrappyType}
        {...props}
      />
      <GoldCousin  {...props} />

      <div className={"lotti-animation-birds flex"} ref={birdsRef}>
        {Object.entries(crappyStages).map(([key, Component]: any, id) => {
          const data = animationData[key];

          return data ? <Component data={data} key={id}
            setType={setCrappyType}
            sound={isSound}
            active={key == activeCrappyType}
            bird={birdsRef}
            {...props}
            start={startCrappyFly}
          /> : <React.Fragment key={id}></React.Fragment>
        })}
      </div >
    </> : null}
  </>
}

export default Crappy;
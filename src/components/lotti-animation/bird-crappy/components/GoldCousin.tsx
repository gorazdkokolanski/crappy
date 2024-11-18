
import { useContext, useEffect, useState } from 'react';

import falling from "/sounds/crapps_falling.mp3";
import { useSoundHook } from '../../../../utils/hooks/useSoundHook';
import Rain from "./Rain";
import Cousin from "./Cousin";
import { Store } from "../../../../types/state";
import AnimContext from "../../../../layouts/AnimationProvider";


type Props = {
  state: Store,
}

const delays = [1391.2, 703.1, 556.7, 338.1, 1501.8, 1755.4, 2223.3, 1002.1, 2735.7, 2637.2];
// background
const GoldCousin = (props: Props) => {
  const { state } = props;
  const { web3: { account }, basePath, myRewardsData } = state.getState()
  const anim = useContext(AnimContext)
  const time = anim.animationTimer
  const [showRain, setShowRain] = useState(false);
  const [rainData, setRainData] = useState(null)
  const playFalling = useSoundHook(falling);


  useEffect(() => {
    const fetchAnimationData = async () => {
      const base = basePath + "lotti/gold-coin";
      try {
        const responses = await fetch(`${base}.json`);
        const data = await responses.json();
        setRainData(data);
      } catch (error) {
      }
    };
    fetchAnimationData();
    return () => { }
  }, [])


  useEffect(() => {
    setShowRain(time.isRound)
    return () => { }
  }, [time.isRound])

  useEffect(() => {
    if (time.showPayout) setShowRain(false)
    return () => { }
  }, [time.showPayout])

  return <>
    <div className={'lotti-animation-gold flex column' + (showRain ? " active" : "")}>
      <div className='svg-wrapper' >
        <div className='rain-wrapper' >
          {rainData && Array.from({ length: 10 }).map((_, id) =>
            <Rain key={id} {...{ rainData, playFalling, delay: delays[id], showRain }} />
          )}
        </div>
      </div>
      {account && Boolean(Number(myRewardsData.levelOf)) && <Cousin {...{ ...props, showRain, path: basePath, myRewardsData }} />}

    </div >
  </>
}

export default GoldCousin;
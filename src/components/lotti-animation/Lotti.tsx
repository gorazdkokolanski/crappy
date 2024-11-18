
import { useContext, useEffect, useState } from 'react';
import Scenes from './back-scenes/Scenes';
import RoundTimer from './counter-animations/RoundTimers';
import Crappy from './bird-crappy/Crappy';
import { Store } from '../../types/state';

export type Progress = {
  progress: number | string | boolean,
  isDone: boolean
}

type Props = {
  state: Store,
  status: any,
}

// background
const Lotti = (props: Props) => {
  const { state } = props;
  const [pauseScene, setPauseScene] = useState(null);

  return (
    <>
      <Scenes state={state} pause={pauseScene} />
      <div className={"lotti-animation lotti-animation-wrapper flex w-full"} data-orientation="true">
        <Crappy setPause={setPauseScene}  {...props} />
      </div>
      <RoundTimer  {...props} />
    </>)
}

export default Lotti;
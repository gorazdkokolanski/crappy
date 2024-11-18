
import { useContext, useEffect, useRef, useState } from "react";
import Text from "../../../ShadowText";
import Tooltip from "../../../Tooltip";
import AnimContext from "../../../../layouts/AnimationProvider";

const titleBets = "PLACE YOUR BETS";
const titleGoing = "Round starts in";
const noBetsTitle = {
  title: "no more bets!",
  subtitle: ["We dont give any flying crap anymore"],
}


type Props = {
  playDefault: any,
  sound: boolean,
  playRed: any,
  roundBets: any,
}

export default function Timer({ roundBets, playDefault, playRed, sound }: Props) {
  const anim = useContext(AnimContext)
  const time = anim.countdownTimer;
  const setTime = anim.setCountdownTimer;
  const playTimer = anim.animationTimer;
  const [onGoing, setOnGoing] = useState(false);
  const counterText = useRef<HTMLDivElement>(null);


  const playConunter = () => {
    setTime(`0.1`);
    anim.setAnimationTimer((e) => ({ ...e, play: false }));
    setOnGoing(false);

    setTimeout(() => {
      window.countdownTime = 0;
    }, 100);
  }

  const getClassName = () => {

    const tip = anim?.roundIsGoing && !playTimer.play ? " only-tip" : "";
    return `animation-round flex column v-center${tip}`
  }

  useEffect(() => {


    // window.playConunter = playConunter;


    if (!playTimer.play) return;
    let interval: any = null;


    const initTimer = () => {
      function onUpdate() {
        const currentTime = Date.now();
        const seconds = window.endRoundTime - currentTime / 1000;
        let time: any = Math.floor(seconds);

        if (seconds < 10) {
          time = (Math.floor(seconds * 10) / 10).toFixed(1)
        }
        if (seconds < 15) {
          seconds > 5 && setOnGoing(true);
        }

        if (time <= 0.1) {
          playConunter()
          return;
        }
        window.countdownTime = time;
        setTime(time)
      }

      interval = setInterval(onUpdate, 90)
      setOnGoing(false);
    }

    initTimer()
    return () => {
      interval && clearInterval(interval);
    }
  }, [playTimer.play])

  useEffect(() => {
    if (!onGoing) return;
    const duration = Number(time) / 2;
    const going = gsap.to(counterText.current, { color: "#DE2B2B", duration })
    anim?.setRoundIsGoing(true)
    return () => {
      going.revert().kill()
    }
  }, [onGoing])


  useEffect(() => {
    let st: any;

    if (playTimer.play && sound) {

      if (onGoing) {
        playDefault.stop();
        playRed.play();
      } else {
        st = setTimeout(() => playDefault.play(), 1000)
        playRed.stop()
      }

    } else {
      playRed.stop()
      playDefault.stop();
    }

    return () => {
      st && clearTimeout(st)
    }
  }, [sound, onGoing, playTimer.play])




  return <>
    <div className={getClassName()} data-orientation="true">
      {playTimer.play ? <>
        <Text text={onGoing ? titleGoing : titleBets} className="font-40" />
        <div className="time" ref={counterText}>
          <Text text={time + "s"} upper={false} />
        </div>

        <div className="flex v-center">
          <div className="user-icon flex icon-user text-shadow"></div>
          <Text text={(Object.keys(roundBets).length).toString() || ""} className="font-24" />
        </div>
      </> : null}
      {anim?.roundIsGoing && <Tooltip {...noBetsTitle} className="relative" />}
    </div>
  </>
}

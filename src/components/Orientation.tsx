import { useEffect, useState } from "react";
import Text from "./ShadowText";
import { Store } from "../types/state";
import { checkLandscape } from "../utils/utils";


type Props = {
  title?: string,
  subtitle?: string,
  className?: string,
  children?: React.ReactNode;
}

const title = "Just how taking a dump while standing sucks, so does playing this game in portrait mode."
const subtitle = "ROTATE your DEVICE to Crap!"


export default function Orientation({ state }: { state: Store }) {
  const { isLandscape } = state.getState()

  useEffect(() => {
    const w = window;
    const on = "addEventListener";
    const off = "removeEventListener";

    const handleOrientationChange = () => {
      const boo = checkLandscape();
      state.setIsLandscape(!boo);
    };


    if (w.innerWidth < 1200) {
      w[on]("resize", handleOrientationChange);
      w[on]("orientationchange", handleOrientationChange);
    }

    return () => {
      w[off]("resize", handleOrientationChange);
      w[off]("orientationchange", handleOrientationChange);
    };
  }, []);

  return false && (
    <div className="device-orientation flex column v-center text-center">
      <Text text={title} />
      <br />
      <br />
      <Text text={subtitle} />

      <div className="icon flex ratio"></div>

    </div>
  )
}
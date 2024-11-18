import { useEffect } from "react";
import Text from "./ShadowText";


type Props = {
  title?: string,
  subtitle?: string[],
  className?: string,
  children?: React.ReactNode;
  sound?: boolean
}

const Tooltip = ({ className = "", title, subtitle, children, sound = true }: Props) => {


  useEffect(() => {
    sound && window.sounds?.error()
    return () => {
      sound && window.sounds?.back()
    }
  }, [])

  return <>
    <div className={"red-tooltip border-black-4 border-4 " + className} data-orientation>
      {title && <Text className="font-32" text={title} />}
      {Boolean(subtitle?.length) && subtitle?.map((t, i) => <Text className="font-20 subtitle" key={i} upper={false} text={t} />)}
      {children}
    </div>

  </>
}

export default Tooltip;
import { useEffect, useRef, useState } from "react";
import { Store } from "../types/state";


type Props = {
  state: Store,
  status: any,
  children: any,
}

export default function Home(props: Props) {
  const { state, status, children } = props
  const sectionRef = useRef<HTMLDivElement>(null)
  const [showAnim] = useState(1)


  useEffect(() => {
    !showAnim && state.setLoading({ scenes: false, heroes: false, })

    const section = sectionRef.current as HTMLDivElement;
    if (!section) return;
    const body = document.body;

    const rs = new ResizeObserver(() => {
      const h = section.clientHeight;
      window["scene-height"] = h;
      body.setAttribute("style", `--scene-height: ${h}px; --bottom-height: ${window.innerHeight - h}px`)
    })
    rs.observe(section);

    return () => {
      rs.disconnect()
    }
  }, [])



  return (
    <>
      <section ref={sectionRef} className={"section-wrapper" + (status.loaded ? "" : " loading")}>
        {Boolean(showAnim) && children}
      </section>
    </>
  );
}

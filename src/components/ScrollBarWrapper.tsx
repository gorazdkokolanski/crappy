import React, { useEffect, useRef } from "react";
import { ScrollBar } from "../utils/ScrollBarFactory";
type Props = {
  children: React.ReactNode;
};

const ScrollBarWrapper = ({ children }: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current as HTMLDivElement;
    const child = scroller.children[0]
    const scrollBar = ScrollBar.create({ scroller: scroller });

    const rs = new ResizeObserver(() => scrollBar._init())
    rs.observe(child);

    return () => {
      scrollBar.kill()
      rs.disconnect()
    }
  }, [scrollerRef])



  return (
    <>
      <div className="pop_up--scroller scroller" ref={scrollerRef}>{children}</div>
    </>
  )
};

export default ScrollBarWrapper;




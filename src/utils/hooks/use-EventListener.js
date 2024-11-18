import React, { useEffect, useState, useRef } from "react";

export function debounce(fn, ms) {
  let timer;
  return (_) => {
    clearTimeout(timer);
    timer = setTimeout((_) => {
      timer = null;
      fn.apply(this, arguments);
    }, ms);
  };
}

export function useEventListener(event, fun, element = window) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = fun;
  }, [fun]);

  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(event, eventListener);
    return () => {
      element.removeEventListener(event, eventListener);
    };
  }, [event, element]);
}

export function useWindowSize() {
  const [dimensions, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = debounce((e) => setWidth(window.innerWidth), 0);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}
export function useWindowScroll() {
  const [scrollY, setScroll] = useState(0);

  const handleScroll = debounce((e) => setScroll(window.window.scrollY), 100);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

// export default ;

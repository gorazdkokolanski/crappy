/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function executedFunction(
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    const context = this;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

type Callback = (entry: ResizeObserverEntry) => void;
type ObservingEntry = { element: Element; callback: Callback };

let resizeObserverInstance: ResizeObserver | any = null;
let observing: Record<Element | any, ObservingEntry> = {};

const onResize = debounce((entries: ResizeObserverEntry[]) => {
  for (let entry of entries) {
    const key = entry.target as any;
    const callback = observing[key]?.callback;
    if (callback) callback(entry);
  }
}, 200);

const init = (): void => {
  if (!resizeObserverInstance) {
    resizeObserverInstance = new ResizeObserver(onResize);
  }
};

function add(element: any, callback: Callback): void {
  init();

  if (typeof callback === "function") {
    observing[element] = { element, callback };
    resizeObserverInstance.observe(element);
  } else {
    console.error("Provided callback is not a function");
  }
}

function remove(element: any, callback: Callback): void {
  const entry = observing[element];
  if (entry && entry.callback === callback) {
    resizeObserverInstance?.unobserve(element);
    delete observing[element];
  } else {
    console.warn("Element not found in observed list or callback mismatch");
  }
}

function destroy(): void {
  if (resizeObserverInstance) {
    resizeObserverInstance.disconnect();
    observing = {};
    resizeObserverInstance = null;
  }
}

export { add, remove, destroy };

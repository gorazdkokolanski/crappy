/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { gsap, Observer } from "gsap/all";
gsap.registerPlugin(Observer);
import * as resizeObserverManager from "./resizeObserverManager";

interface ScrollBarOptions {
  scroller?: HTMLElement;
  draggable?: boolean;
  isMobile?: number;
  direction?: "x" | "y";
  scrollbarClass?: string | null;
  preventParentScroll?: boolean;
}

export class ScrollBar {
  private initialized: boolean;
  private isActive: boolean;
  private bodyScroll: boolean;
  private preventParentScroll: boolean;
  private scroller: HTMLElement | any;
  private scrollbarClass: string | null;
  private wrapper: HTMLElement;
  private isDraggable: boolean;
  private isMobile: number;
  private direction: "x" | "y";
  private posY: number;
  private scrollerHeight: number | any;
  private wrapperHeight?: number;
  private bar: HTMLElement | any;
  private track: HTMLElement | any;
  private trackHeight?: number;
  private realScrollLength?: number;
  private realTrackPath?: number;
  private topOffset?: number;
  private setTrackY?: any;
  private dragObserver?: any;
  private trackY?: number;
  private isDragging?: boolean;
  private pointerOnTrack?: number;
  private isVisible?: boolean;

  static create(options: ScrollBarOptions): ScrollBar {
    return new ScrollBar(options);
  }

  constructor(options: ScrollBarOptions) {
    const {
      scroller = this._getScroller(options?.scroller),
      draggable = true,
      isMobile = 300,
      direction = "y",
      scrollbarClass = null,
      preventParentScroll = false,
    } = options || {};

    this.initialized = false;
    this.isActive = false;

    this.bodyScroll = !options?.scroller;
    this.preventParentScroll = preventParentScroll;
    this.scroller = scroller;
    this.scrollbarClass = scrollbarClass;

    this.wrapper = this._getWrapper();
    this.isDraggable = draggable !== false;
    this.isMobile = isMobile;
    this.direction = direction;
    this.posY = this.scroller.scrollTop;

    this._update = this._update.bind(this);
    this._debounce = this._debounce.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    resizeObserverManager.add(this.wrapper, this._onResize);
    this._onResize();
  }

  private _onResize = (): void => {
    if (this.initialized && !this.isActive) return;

    if (window.innerWidth > this.isMobile) {
      this._init();
    } else {
      this.kill();
    }
  };

  public _init(): void {
    this.scrollerHeight = this.scroller.scrollHeight;
    this.wrapperHeight = this.bodyScroll
      ? window.innerHeight
      : this.wrapper.clientHeight;

    if (this.scrollerHeight <= this.wrapperHeight) {
      this.kill();
      return;
    }

    if (!this.bar) {
      this._createElement();
    }

    this.trackHeight =
      this.wrapperHeight / (this.scrollerHeight / this.wrapperHeight);
    this.realScrollLength = this.scrollerHeight - this.wrapperHeight;
    this.realTrackPath = this.bar.clientHeight - this.trackHeight;
    this.track.style.height = `${this.trackHeight}px`;
    this.topOffset = this.bar.offsetTop;
    this.setTrackY = gsap.quickSetter(this.track, "y", "px");

    if (this.preventParentScroll) {
      this.scroller.setAttribute("data-lenis-prevent", "true");
    }

    this.initialized = true;
    this.dragHandle();
    this.start();
  }

  private _createElement(): void {
    this.bar = document.createElement("div");
    this.track = document.createElement("div");
    this.bar.classList.add(`scroll-bar`);
    if (this.scrollbarClass) {
      this.bar.classList.add(this.scrollbarClass);
    }

    this.bar.style.position = this.bodyScroll ? "fixed" : "absolute";
    this.track.classList.add("scroll-track");
    this.bar.appendChild(this.track);
    this.wrapper.appendChild(this.bar);
  }

  private _update(): void {
    if (!this.initialized || !this.isActive) return;

    if (!this.isDragging) {
      this.trackY =
        this.realTrackPath! *
        (this.scroller.scrollTop / this.realScrollLength!);
    }

    this.setTrackY!(this.trackY!);
  }

  private dragHandle(): void {
    if (!this.isDraggable) {
      return;
    }

    if (!this.dragObserver) {
      this.dragObserver = Observer.create({
        target: this.track,
        // axis: this.direction,
        onPress: (self: any) => {

          let offsetY = 0;

          const barTop = this.bar!.getBoundingClientRect().top;
          
          switch (self.event.type) {
            case "touchstart":
              offsetY =
                self.event?.touches[0].clientY - barTop - (this.trackY || 0);
              break;
            default:
              offsetY = self.event.offsetY;
          }

          this.bar!.classList.add("is-dragging");
          this.wrapper.style.cursor = "grabbing";
          this.scroller.style.pointerEvents = "none";
          this.scroller.style.userSelect = "none";
          this.pointerOnTrack = offsetY + barTop;
        },
        onRelease: () => {
          this.bar!.classList.remove("is-dragging");
          this.wrapper.style.cursor = "";
          this.scroller.style.pointerEvents = "";
          this.scroller.style.userSelect = "";
        },
        onDragStart: () => {
          this.isDragging = true;
        },
        onDragEnd: () => {
          this.isDragging = false;
        },
        onDrag: (self: any) => {
          let clientY = 0;

          switch (self.event.type) {
            case "touchmove":
              clientY = self.event.touches[0].clientY;
              break;
            default:
              clientY = self.event.clientY;
          }

          this.trackY = Math.max(
            0,
            Math.min(clientY - this.pointerOnTrack!, this.realTrackPath!)
          );

          this.posY = Math.max(
            0,
            Math.min(
              (this.trackY * this.realScrollLength!) / this.realTrackPath!,
              this.realScrollLength!
            )
          );
          this.scroller.scrollTop = this.posY;
        },
      });
    }
  }

  public start(): void {
    if (this.isActive) return;

    if (this.bar) {
      this.bar.classList.add("visible");
    }
    this.isVisible = true;
    this.isActive = true;
    if (this.dragObserver) {
      this.dragObserver.enable();
    }
    gsap.ticker.add(this._update);
  }

  public stop(): void {
    if (!this.isActive) return;

    if (this.bar) {
      this.bar.classList.remove("visible");
    }
    this.isVisible = false;
    this.isActive = false;
    if (this.dragObserver) {
      this.dragObserver.disable();
    }
    gsap.ticker.remove(this._update);
  }

  public kill(): void {
    if (!this.initialized) return;

    this.stop();

    if (this.dragObserver) {
      this.dragObserver.kill();
      this.dragObserver = null;
    }

    if (this.bar) {
      this.bar.remove();
      this.bar = null;
    }

    resizeObserverManager.remove(this.wrapper, this._onResize);
  }

  private _getScroller(scroller?: HTMLElement | string): HTMLElement {
    if (typeof scroller === "object") {
      return scroller;
    } else if (typeof scroller === "string") {
      return document.querySelector(scroller) as HTMLElement;
    } else {
      return (
        (document.scrollingElement as HTMLElement) ||
        (document.documentElement as HTMLElement) ||
        (document.body.parentNode as HTMLElement) ||
        (document.body as HTMLElement)
      );
    }
  }

  private _getWrapper(): HTMLElement {
    if (this.bodyScroll) {
      return this.scroller === document.body && document.documentElement
        ? document.documentElement
        : this.scroller;
    } else {
      return this.scroller.parentNode as HTMLElement;
    }
  }

  private _debounce(func: Function, delay: number): (...args: any[]) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

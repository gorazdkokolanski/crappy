import React, { useEffect, useState, useRef } from 'react';
import store from '../../redux/state';

export function useSoundHook(src: string, options?: any) {
  const audio = useRef<HTMLAudioElement>();
  const isSound = store.getState().isSound;

  const play = (delay = 500, attempts = 0, max = 2) => {
    const audioref = audio.current;
    const sound = store.getState().isSound;

    // return;

    if (sound && audioref) {
      audioref.currentTime = 0;
      audioref.play().catch(() => {
        attempts < max &&
          setTimeout(() => play(delay, attempts + 1, max), delay);
      });
    }
  };
  const stop = () => {
    const sound = audio.current;
    if (sound) {
      sound.currentTime = 0;
      sound.pause();
    }
  };

  useEffect(() => {
    if (!isSound || audio.current) return;
    if (!audio.current) {
      audio.current = new Audio(src);
    }
    const sound: any = audio.current;

    options &&
      Object.keys(options).forEach((key: string) => {
        sound[key] = options[key];
      });
    return () => {
      if (sound) {
        sound.pause();
      }
      // audio.current = undefined;
    };
  }, [isSound]);

  useEffect(() => {
    return () => {
      audio.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (audio.current) {
      audio.current.volume = isSound ? 1 : 0;
    }
    return () => {};
  }, [isSound]);

  return { play, stop, audio: () => audio.current };
}

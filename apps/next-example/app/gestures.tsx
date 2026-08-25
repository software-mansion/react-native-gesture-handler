'use client';

import { useState } from 'react';
import {
  GestureDetector,
  useLongPressGesture,
  usePanGesture,
  useTapGesture,
} from 'react-gesture-handler';

export function Gestures() {
  const [taps, setTaps] = useState(0);
  const [longPresses, setLongPresses] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const tap = useTapGesture({
    onActivate: () => {
      setTaps((t) => t + 1);
    },
    runOnJS: true,
  });

  const longPress = useLongPressGesture({
    minDuration: 400,
    onActivate: () => {
      setLongPresses((c) => c + 1);
    },
    runOnJS: true,
  });

  const pan = usePanGesture({
    onActivate: () => {
      setDragging(true);
    },
    onUpdate: (event) => {
      setDrag({ x: event.translationX, y: event.translationY });
    },
    onDeactivate: () => {
      setDragging(false);
    },
    runOnJS: true,
  });

  return (
    <>
      <p id="status">
        {`taps: ${taps} | dragging: ${dragging} | dx: ${Math.round(drag.x)} | dy: ${Math.round(drag.y)} | longPresses: ${longPresses}`}
      </p>
      <GestureDetector gesture={tap}>
        <button
          id="tap-target"
          type="button"
          style={{ fontSize: 18, padding: 12 }}>
          Tap target
        </button>
      </GestureDetector>
      <GestureDetector gesture={longPress}>
        <div
          id="long-press-target"
          style={{
            display: 'inline-block',
            padding: 16,
            fontSize: 18,
            marginLeft: 12,
            border: '1px solid rebeccapurple',
            borderRadius: 8,
            userSelect: 'none',
          }}>
          Long-press target
        </div>
      </GestureDetector>
      <GestureDetector gesture={pan}>
        <div
          id="pan-target"
          style={{
            width: 160,
            height: 160,
            marginTop: 24,
            borderRadius: 16,
            background: 'rebeccapurple',
            transform: `translate(${drag.x}px, ${drag.y}px)`,
            touchAction: 'none',
          }}
        />
      </GestureDetector>
    </>
  );
}

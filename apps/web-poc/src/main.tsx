import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  GestureDetector,
  usePanGesture,
  useTapGesture,
} from 'react-gesture-handler';

function App() {
  const [taps, setTaps] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const tap = useTapGesture({
    onActivate: () => {
      setTaps((t) => t + 1);
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
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>react-gesture-handler PoC</h1>
      <p id="status">
        {`taps: ${taps} | dragging: ${dragging} | dx: ${Math.round(drag.x)} | dy: ${Math.round(drag.y)}`}
      </p>
      <GestureDetector gesture={tap}>
        <button
          id="tap-target"
          type="button"
          style={{ fontSize: 18, padding: 12 }}>
          Tap target
        </button>
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
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

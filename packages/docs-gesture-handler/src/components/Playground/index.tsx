import FlingExample from '@site/src/components/GestureExamples/FlingExample';
import GestureExample from '@site/src/components/GestureExamples/GestureExampleItem';
import LongPressExample from '@site/src/components/GestureExamples/LongPressExample';
import PanExample from '@site/src/components/GestureExamples/PanExample';
import PinchExample from '@site/src/components/GestureExamples/PinchExample';
import RotationExample from '@site/src/components/GestureExamples/RotationExample';
import TapExample from '@site/src/components/GestureExamples/TapExample';
import React from 'react';

import styles from './styles.module.css';

const examples = [
  {
    title: 'usePanGesture()',
    component: <PanExample />,
    href: 'docs/gestures/use-pan-gesture',
  },
  {
    title: 'useTapGesture()',
    component: <TapExample />,
    href: 'docs/gestures/use-tap-gesture',
  },
  {
    title: 'useRotationGesture()',
    component: <RotationExample />,
    href: 'docs/gestures/use-rotation-gesture',
  },
  {
    title: 'useFlingGesture()',
    component: <FlingExample />,
    href: 'docs/gestures/use-fling-gesture',
  },
  {
    title: 'useLongPressGesture()',
    component: <LongPressExample />,
    href: 'docs/gestures/use-long-press-gesture',
  },
  {
    title: 'usePinchGesture()',
    component: <PinchExample />,
    href: 'docs/gestures/use-pinch-gesture',
  },
];

const Playground = () => {
  return (
    <div>
      <div>
        <h2 className={styles.heading}>Learn how it works</h2>
        <p className={styles.subheading}>
          Tap and drag the circles to explore the gestures.
        </p>
      </div>
      <div className={styles.playground}>
        {examples.map((example, idx) => (
          <GestureExample
            key={idx}
            idx={idx}
            title={example.title}
            component={example.component}
            href={example.href}
          />
        ))}
      </div>
    </div>
  );
};

export default Playground;

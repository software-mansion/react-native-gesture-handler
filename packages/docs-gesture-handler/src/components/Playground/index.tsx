import React from 'react';
import styles from './styles.module.css';
import GestureExample from '@site/src/components/GestureExamples/GestureExampleItem';
import PanExample from '@site/src/components/GestureExamples/PanExample';
import TapExample from '@site/src/components/GestureExamples/TapExample';
import FlingExample from '@site/src/components/GestureExamples/FlingExample';
import LongPressExample from '@site/src/components/GestureExamples/LongPressExample';
import RotationExample from '@site/src/components/GestureExamples/RotationExample';
import PinchExample from '@site/src/components/GestureExamples/PinchExample';

const examples = [
  {
    title: 'Gesture.Pan()',
    component: <PanExample />,
    href: 'docs/gestures/pan-gesture',
  },
  {
    title: 'Gesture.Tap()',
    component: <TapExample />,
    href: 'docs/gestures/tap-gesture',
  },
  {
    title: 'Gesture.Rotation()',
    component: <RotationExample />,
    href: 'docs/gestures/rotation-gesture',
  },
  {
    title: 'Gesture.Fling()',
    component: <FlingExample />,
    href: 'docs/gestures/fling-gesture',
  },
  {
    title: 'Gesture.LongPress()',
    component: <LongPressExample />,
    href: 'docs/gestures/long-press-gesture',
  },
  {
    title: 'Gesture.Pinch()',
    component: <PinchExample />,
    href: 'docs/gestures/pinch-gesture',
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

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
  },
  {
    title: 'Gesture.Tap()',
    component: <TapExample />,
  },
  {
    title: 'Gesture.Rotation()',
    component: <RotationExample />,
  },
  {
    title: 'Gesture.Fling()',
    component: <FlingExample />,
  },
  {
    title: 'Gesture.LongPress()',
    component: <LongPressExample />,
  },
  {
    title: 'Gesture.Pinch()',
    component: <PinchExample />,
  },
];

const Playground = () => {
  return (
    <div>
      <div>
        <h2 className={styles.heading}>Learn how it works</h2>
        <p className={styles.subheading}>
          Hover over cards to see our interaction.
        </p>
      </div>
      <div className={styles.playground}>
        {examples.map((example, idx) => (
          <GestureExample
            key={idx}
            idx={idx}
            title={example.title}
            component={example.component}
          />
        ))}
      </div>
    </div>
  );
};

export default Playground;

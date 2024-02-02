import React from 'react';
import styles from './styles.module.css';
import GestureExample from '@site/src/components/GestureExample';
import PanExample from '@site/src/components/GesturePlayground/PanExample';
import InteractiveExampleComponent from '@site/src/components/InteractiveExampleComponent';

const GesturePlayground = () => {
  return (
    <div>
      <div id={'2'} className={styles.animationsSectionWrapper}>
        <div>
          <InteractiveExampleComponent
            idx={3}
            label={'Label'}
            component={<PanExample />}
          />
        </div>
      </div>
      <div>
        <h2 className={styles.heading}>Learn how it works</h2>
        <p className={styles.subheading}>
          Hover over cards to see our interaction.
        </p>
      </div>
      <div className={styles.playground}>
        <GestureExample title="Gesture.Pan()" commponent={PanExample} />
        <GestureExample title="Gesture.Tap()" />
        <GestureExample title="Gesture.Rotation()" />
        <GestureExample title="Gesture.Fling()" />
        <GestureExample title="Gesture.LongPress()" />
        <GestureExample title="Gesture.Pinch()" />
      </div>
    </div>
  );
};

export default GesturePlayground;

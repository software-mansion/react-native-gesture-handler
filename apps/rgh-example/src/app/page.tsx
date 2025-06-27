'use client';

import styles from './page.module.css';
import { GestureDetector, Gesture } from 'react-gesture-handler';

export default function Home() {
  const g = Gesture.Pan().onUpdate(console.log);

  return (
    <div className={styles.page}>
      <GestureDetector gesture={g}>
        <div
          id="box"
          style={{ width: 100, height: 100, backgroundColor: 'blue' }}></div>
      </GestureDetector>
    </div>
  );
}

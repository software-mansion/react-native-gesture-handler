import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  GestureHandlerRootView,
  Touchable,
} from 'react-native-gesture-handler';

import styles from './styles.module.css';

function TouchableDemo() {
  return (
    <div className={styles.card}>
      <GestureHandlerRootView style={rnStyles.root}>
        <Touchable
          style={rnStyles.button}
          activeOpacity={0.8}
          underlayColor="var(--swm-purple-dark-140)"
          hoverScale={1.04}
          hoverUnderlayOpacity={0.15}>
          <Text style={rnStyles.buttonText}>Press me</Text>
        </Touchable>
      </GestureHandlerRootView>
    </div>
  );
}

const TouchableShowcase = () => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <span className={styles.badge}>New</span>
        <h2 className={styles.title}>Meet Touchable</h2>
        <p className={styles.description}>
          One fully customizable component meant to supersede Pressable and
          Buttons. It comes with native scale, opacity, underlay, and Android
          ripple feedback built in.
        </p>
        <a
          className={styles.link}
          href="/react-native-gesture-handler/docs/components/touchable">
          View docs <span aria-hidden="true">→</span>
        </a>
      </div>
      <div className={styles.demo}>
        <BrowserOnly fallback={<div className={styles.demoFallback} />}>
          {() => <TouchableDemo />}
        </BrowserOnly>
      </div>
    </div>
  );
};

const rnStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    backgroundColor: 'var(--swm-purple-light-100)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TouchableShowcase;

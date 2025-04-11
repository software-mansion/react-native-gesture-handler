import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerStateChangeEvent,
  LongPressGestureHandler,
} from 'react-native-gesture-handler';
import { stringify } from '../utils';

export const LongPressTest = () => {
  const [stateText, setStateText] = useState(0);
  const [eventText, setEventText] = useState('');

  const onLongPress = (event: GestureHandlerStateChangeEvent) => {
    setStateText(event.nativeEvent.state);
    setEventText(stringify(event));
  };

  return (
    <LongPressGestureHandler onHandlerStateChange={onLongPress}>
      <div style={styles.box}>
        <div data-testid="longPressStateBox">{stateText}</div>
        <div data-testid="longPressEventBox" style={styles.eventText}>
          {eventText}
        </div>
      </div>
    </LongPressGestureHandler>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'yellow',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  eventText: {
    display: 'none',
  },
});

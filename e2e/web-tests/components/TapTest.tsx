import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerStateChangeEvent,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { stringify } from '../utils';

export const TapTest = () => {
  const [stateText, setStateText] = useState(0);
  const [eventText, setEventText] = useState('');

  const onSingleTap = (event: GestureHandlerStateChangeEvent) => {
    setStateText(event.nativeEvent.state);
    setEventText(stringify(event));
  };

  return (
    <TapGestureHandler onHandlerStateChange={onSingleTap}>
      <div style={styles.box}>
        <div data-testid="tapStateBox">{stateText}</div>
        <div data-testid="tapEventBox" style={styles.eventText}>
          {eventText}
        </div>
      </div>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'crimson',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  eventText: {
    display: 'none',
  },
});

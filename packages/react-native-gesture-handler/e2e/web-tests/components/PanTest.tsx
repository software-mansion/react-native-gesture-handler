import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureHandlerStateChangeEvent,
  GestureHandlerGestureEvent,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import { stringify } from '../utils';

export function PanTest() {
  const [stateText, setStateText] = useState(0);
  const [eventText, setEventText] = useState('');

  function onHandlerStateChange(e: GestureHandlerStateChangeEvent) {
    setStateText(e.nativeEvent.state);
    setEventText(stringify(e));
  }

  function onGestureEvent(e: GestureHandlerGestureEvent) {
    setStateText(e.nativeEvent.state);
    setEventText(stringify(e));
  }

  return (
    <PanGestureHandler
      onHandlerStateChange={onHandlerStateChange}
      onGestureEvent={onGestureEvent}
      minDist={5}>
      <div style={styles.box}>
        <div data-testid="panStateBox">{stateText}</div>
        <div data-testid="panEventBox" style={styles.eventText}>
          {eventText}
        </div>
      </div>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'lightgreen',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  eventText: {
    display: 'none',
  },
});

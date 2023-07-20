import React, { useState } from 'react';

import { StyleSheet } from 'react-native';
import {
  GestureHandlerStateChangeEvent,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { stringify } from '../utils';

const doubleTapRef = React.createRef();

export function DoubleTapTest() {
  const [singleTapStateText, setSingleTapStateText] = useState(0);
  const [singleTapEventText, setSingleTapEventText] = useState('');

  const [doubleTapStateText, setDoubleTapStateText] = useState(0);
  const [doubleTapEventText, setDoubleTapEventText] = useState('');

  const onSingleTap = (e: GestureHandlerStateChangeEvent) => {
    setSingleTapStateText(e.nativeEvent.state);
    setSingleTapEventText(stringify(e));
  };

  const onDoubleTap = (e: GestureHandlerStateChangeEvent) => {
    setDoubleTapStateText(e.nativeEvent.state);
    setDoubleTapEventText(stringify(e));
  };

  return (
    <TapGestureHandler
      onHandlerStateChange={onSingleTap}
      waitFor={doubleTapRef}>
      <TapGestureHandler
        ref={doubleTapRef}
        numberOfTaps={2}
        onHandlerStateChange={onDoubleTap}>
        <div style={styles.box}>
          <div data-testid="tapTextTest">
            {singleTapStateText}:{doubleTapStateText}
          </div>
          <div data-testid="singleTapEventBox" style={styles.eventText}>
            {singleTapEventText}
          </div>
          <div data-testid="doubleTapEventBox" style={styles.eventText}>
            {doubleTapEventText}
          </div>
        </div>
      </TapGestureHandler>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'lightblue',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  eventText: {
    display: 'none',
  },
});

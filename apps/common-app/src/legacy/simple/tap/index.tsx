import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

interface PressBoxProps {
  setDuration?: (duration: number) => void;
}

export class PressBox extends Component<PressBoxProps> {
  private doubleTapRef = React.createRef<TapGestureHandler>();
  private onSingleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // eslint-disable-next-line no-alert
      window.alert("I'm touched");
    }
  };
  private onDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // eslint-disable-next-line no-alert
      window.alert('Double tap, good job!');
    }
  };
  render() {
    return (
      <TapGestureHandler
        onHandlerStateChange={this.onSingleTap}
        waitFor={this.doubleTapRef}>
        <TapGestureHandler
          ref={this.doubleTapRef}
          onHandlerStateChange={this.onDoubleTap}
          numberOfTaps={2}>
          <View style={styles.box} />
        </TapGestureHandler>
      </TapGestureHandler>
    );
  }
}

export default class Example extends Component<Record<string, never>> {
  render() {
    return <PressBox />;
  }
}

const styles = StyleSheet.create({
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
  },
});

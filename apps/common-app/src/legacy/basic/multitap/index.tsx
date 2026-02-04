import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import {
  LongPressGestureHandler,
  ScrollView,
  State,
  TapGestureHandler,
  LongPressGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../../../common';

interface PressBoxProps {
  setDuration?: (duration: number) => void;
}

interface ExampleState {
  longPressDuration: number;
}
export class PressBox extends Component<PressBoxProps> {
  private doubleTapRef = React.createRef<TapGestureHandler>();
  private onHandlerStateChange = (
    event: LongPressGestureHandlerStateChangeEvent
  ) => {
    this.props.setDuration?.(event.nativeEvent.duration);
  };
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
      <LongPressGestureHandler
        onHandlerStateChange={this.onHandlerStateChange}
        minDurationMs={800}>
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
      </LongPressGestureHandler>
    );
  }
}

export default class Example extends Component<
  Record<string, never>,
  ExampleState
> {
  constructor(props: Record<string, never>) {
    super(props);

    this.state = { longPressDuration: 0 };
  }

  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <LoremIpsum words={40} />
        <Text style={styles.text}>
          Duration of the last long press: {this.state.longPressDuration}ms
        </Text>
        <PressBox
          setDuration={(duration: number) =>
            this.setState({ longPressDuration: duration })
          }
        />
        <LoremIpsum />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
  },
  text: {
    marginLeft: 20,
  },
});

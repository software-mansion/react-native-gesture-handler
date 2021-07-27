import React, { Component } from 'react';
import { StyleSheet, View, Alert, Text } from 'react-native';

import {
  LongPressGestureHandler,
  ScrollView,
  State,
  TapGestureHandler,
  LongPressGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
  PanGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../common';

interface PressBoxProps {
  setDuration: (duration: number) => void;
}

interface ExampleState {
  longPressDuration: number;
}
export class PressBox extends Component<PressBoxProps> {
  private tapRef = React.createRef<TapGestureHandler>();
  private longPressRef = React.createRef<TapGestureHandler>();
  private tX = 0;
  private tY = 0;
  private onTap = (event: TapGestureHandlerStateChangeEvent) => {
    console.log('tap ' + event.nativeEvent.state);
  };
  private onLongPress = (event: LongPressGestureHandlerStateChangeEvent) => {
    console.log('long ' + event.nativeEvent.state);
  };

  private onPan = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      this.tX = event.nativeEvent.translationX;
      this.tY = event.nativeEvent.translationY;

      this.forceUpdate();
    }
  };

  render() {
    return (
      <TapGestureHandler onHandlerStateChange={this.onTap} ref={this.tapRef}>
        <LongPressGestureHandler
          onHandlerStateChange={this.onLongPress}
          minDurationMs={700}
          ref={this.longPressRef}
          after={this.tapRef}
          simultaneousHandlers={this.tapRef}>
          <PanGestureHandler
            onGestureEvent={this.onPan}
            onHandlerStateChange={this.onPan}
            simultaneousHandlers={[this.tapRef, this.longPressRef]}
            after={this.longPressRef}>
            <View
              style={[
                styles.box,
                {
                  transform: [{ translateX: this.tX }, { translateY: this.tY }],
                },
              ]}
            />
          </PanGestureHandler>
        </LongPressGestureHandler>
      </TapGestureHandler>
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

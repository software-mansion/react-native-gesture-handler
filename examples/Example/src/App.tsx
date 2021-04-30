import React, { Component } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  RectButton,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

type DraggableBoxProps = {
  minDist?: number;
  boxStyle?: StyleProp<ViewStyle>;
};

export class DraggableBox extends Component<DraggableBoxProps> {
  private translateX: Animated.Value;
  private translateY: Animated.Value;
  private lastOffset: { x: number; y: number };
  private onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  constructor(props: DraggableBoxProps) {
    super(props);
    this.translateX = new Animated.Value(0);
    this.translateY = new Animated.Value(0);
    this.lastOffset = { x: 0, y: 0 };
    this.onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this.translateX,
            translationY: this.translateY,
          },
        },
      ],
      { useNativeDriver: true }
    );
  }
  private onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this.lastOffset.x += event.nativeEvent.translationX;
      this.lastOffset.y += event.nativeEvent.translationY;
      this.translateX.setOffset(this.lastOffset.x);
      this.translateX.setValue(0);
      this.translateY.setOffset(this.lastOffset.y);
      this.translateY.setValue(0);
    }
  };
  render() {
    return (
      <PanGestureHandler
        {...this.props}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}
        minDist={this.props.minDist ? 100 : undefined}
        hitSlop={5}>
        <Animated.View
          style={[
            styles.box,
            {
              transform: [
                { translateX: this.translateX },
                { translateY: this.translateY },
              ],
            },
            this.props.boxStyle,
          ]}
        />
      </PanGestureHandler>
    );
  }
}

export default class Example extends Component<{}, { drag: boolean }> {
  render() {
    return (
      <SafeAreaView style={styles.scrollView}>
        <GestureHandlerRootView>
          <RectButton
            style={{ alignSelf: 'center', margin: 20 }}
            onPress={() =>
              this.setState((prevState) => ({
                drag: prevState?.drag ? false : true,
              }))
            }>
            <Text>
              {this.state?.drag
                ? 'Click to remove dragging'
                : 'Click to add dragging'}
            </Text>
          </RectButton>
          <DraggableBox minDist={this.state?.drag ? 1 : undefined} />
        </GestureHandlerRootView>
      </SafeAreaView>
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
    backgroundColor: 'pink',
  },
});

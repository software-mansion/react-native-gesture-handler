import React, { Component, PropsWithChildren } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  RectButton,
  LongPressGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  BorderlessButton,
  BorderlessButtonProps,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../../config';
import { LoremIpsum } from '../../common';

const RATIO = 3;

type Props = {
  enableTrackpadTwoFingerGesture: boolean;
};

export class Swipeable extends Component<PropsWithChildren<Props>> {
  private width: number;
  private dragX: Animated.Value;
  private transX: Animated.AnimatedInterpolation<number>;
  private showLeftAction: Animated.AnimatedInterpolation<number>;
  private showRightAction: Animated.AnimatedInterpolation<number>;
  private onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  constructor(props: Props) {
    super(props);
    this.width = 0;
    this.dragX = new Animated.Value(0);
    this.transX = this.dragX.interpolate({
      inputRange: [0, RATIO],
      outputRange: [0, 1],
    });
    this.showLeftAction = this.dragX.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 0, 1],
    });
    this.showRightAction = this.dragX.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [1, 0, 0],
    });
    this.onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: this.dragX } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  private onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const dragToss = 0.05;
      const endOffsetX =
        event.nativeEvent.translationX + dragToss * event.nativeEvent.velocityX;

      let toValue = 0;
      if (endOffsetX > this.width / 2) {
        toValue = this.width * RATIO;
      } else if (endOffsetX < -this.width / 2) {
        toValue = -this.width * RATIO;
      }

      Animated.spring(this.dragX, {
        velocity: event.nativeEvent.velocityX,
        tension: 15,
        friction: 5,
        toValue,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };
  private onLayout = (event: LayoutChangeEvent) => {
    this.width = event.nativeEvent.layout.width;
  };
  private reset = () => {
    Animated.spring(this.dragX, {
      toValue: 0,
      useNativeDriver: USE_NATIVE_DRIVER,
      tension: 15,
      friction: 5,
    }).start();
  };
  render() {
    const { children } = this.props;
    return (
      <View>
        <Animated.View
          style={[styles.rowAction, { opacity: this.showLeftAction }]}>
          <RectButton
            style={[styles.rowAction, styles.leftAction]}
            onPress={this.reset}>
            <Text style={styles.actionButtonText}>Green</Text>
          </RectButton>
        </Animated.View>
        <Animated.View
          style={[styles.rowAction, { opacity: this.showRightAction }]}>
          <RectButton
            style={[styles.rowAction, styles.rightAction]}
            onPress={this.reset}>
            <Text style={styles.actionButtonText}>Red</Text>
          </RectButton>
        </Animated.View>
        <PanGestureHandler
          {...this.props}
          activeOffsetX={[-10, 10]}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onHandlerStateChange}>
          <Animated.View
            style={{
              backgroundColor: 'white',
              transform: [{ translateX: this.transX }],
            }}
            onLayout={this.onLayout}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
}

export const InfoButton = (props: BorderlessButtonProps & { name: string }) => (
  <BorderlessButton
    {...props}
    style={styles.infoButton}
    // eslint-disable-next-line no-alert
    onPress={() => window.alert(`${props.name} info button clicked`)}>
    <View style={styles.infoButtonBorders}>
      <Text style={styles.infoButtonText}>i</Text>
    </View>
  </BorderlessButton>
);

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <LoremIpsum words={40} />
          <Swipeable enableTrackpadTwoFingerGesture>
            <RectButton
              style={styles.rectButton}
              // eslint-disable-next-line no-alert
              onPress={() => window.alert('First row clicked')}>
              <Text style={styles.buttonText}>
                Swipe this row & observe highlight delay
              </Text>
              {/* Info icon will cancel when you scroll in the direction of the scrollview
                  but if you move finger horizontally it would allow you to "re-enter" into
                  an active state. This is typical for most of the buttons on iOS (but not
                  on Android where the touch cancels as soon as you leave the area of the
                  button). */}
              <InfoButton name="first" />
            </RectButton>
          </Swipeable>
          <View style={styles.buttonDelimiter} />
          <RectButton
            style={styles.rectButton}
            // eslint-disable-next-line no-alert
            onPress={() => window.alert('Second row clicked')}>
            <Text style={styles.buttonText}>
              Second info icon will block scrolling
            </Text>
            {/* Info icon will block interaction with other gesture handlers including
                  the scrollview handler its a descendant of. This is typical for buttons
                  embedded in a scrollable content on iOS. */}
            <InfoButton disallowInterruption name="second" />
          </RectButton>
          <View style={styles.buttonDelimiter} />
          <RectButton
            rippleColor="red"
            style={styles.rectButton}
            // eslint-disable-next-line no-alert
            onPress={() => window.alert('Third row clicked')}>
            <Text style={styles.buttonText}>
              This one will cancel when you drag outside
            </Text>
            {/* Info icon will cancel when you drag your finger outside of its bounds and
                  then back unlike all the previous icons that would activate when you re-enter
                  their activation area. This is a typical bahaviour for android but less frequent
                  for most of the iOS native apps. */}
            <InfoButton shouldCancelWhenOutside name="third" />
          </RectButton>
          <View style={styles.buttonDelimiter} />
          <Swipeable enableTrackpadTwoFingerGesture>
            <RectButton
              enabled={false}
              style={styles.rectButton}
              // eslint-disable-next-line no-alert
              onPress={() => window.alert('Fourth row clicked')}>
              <Text style={styles.buttonText}>
                This row is &quot;disabled&quot; but you can swipe it
              </Text>
              <InfoButton name="fourth" />
            </RectButton>
          </Swipeable>
          <LongPressGestureHandler
            onHandlerStateChange={({ nativeEvent }) =>
              // eslint-disable-next-line no-alert
              nativeEvent.state === State.ACTIVE && window.alert('Long')
            }>
            <RectButton
              rippleColor="red"
              style={styles.rectButton}
              // eslint-disable-next-line no-alert
              onPress={() => window.alert('Fifth row clicked')}>
              <Text style={styles.buttonText}>
                Clickable row with long press handler
              </Text>
            </RectButton>
          </LongPressGestureHandler>
          <LoremIpsum />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rectButton: {
    flex: 1,
    height: 60,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  rowAction: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAction: {
    backgroundColor: '#4CAF50',
  },
  rightAction: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonDelimiter: {
    height: 1,
    backgroundColor: '#999',
  },
  buttonText: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  infoButton: {
    width: 40,
    height: 40,
  },
  infoButtonBorders: {
    borderColor: '#467AFB',
    borderWidth: 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 10,
  },
  infoButtonText: {
    color: '#467AFB',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
});

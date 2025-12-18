import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
  LegacyScrollView,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../../config';
import { LoremIpsum } from '../../common';

const windowWidth = Dimensions.get('window').width;
const circleRadius = 30;

type Props = {
  tapRef: React.RefObject<TapGestureHandler | null>;
  panRef: React.RefObject<PanGestureHandler | null>;
};

export class TapOrPan extends Component<Props> {
  private touchX: Animated.Value;
  private translateX: Animated.AnimatedAddition<number>;
  private onPanGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  constructor(props: Props) {
    super(props);
    this.touchX = new Animated.Value(windowWidth / 2 - circleRadius);
    this.translateX = Animated.add(
      this.touchX,
      new Animated.Value(-circleRadius)
    );
    this.onPanGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            x: this.touchX,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }

  private onTapHandlerStateChange = ({
    nativeEvent,
  }: TapGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      // Once tap happened we set the position of the circle under the tapped spot
      this.touchX.setValue(nativeEvent.x);
    }
  };

  render() {
    const { tapRef, panRef } = this.props;
    return (
      <TapGestureHandler
        ref={tapRef}
        waitFor={panRef}
        onHandlerStateChange={this.onTapHandlerStateChange}
        shouldCancelWhenOutside>
        <Animated.View style={styles.wrapper}>
          <PanGestureHandler
            ref={panRef}
            activeOffsetX={[-20, 20]}
            onGestureEvent={this.onPanGestureEvent}
            shouldCancelWhenOutside>
            <Animated.View style={styles.horizontalPan}>
              <Animated.View
                style={[
                  styles.circle,
                  {
                    transform: [
                      {
                        translateX: this.translateX,
                      },
                    ],
                  },
                ]}
              />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    const tapRef = React.createRef<TapGestureHandler>();
    const panRef = React.createRef<PanGestureHandler>();
    return (
      <LegacyScrollView waitFor={[tapRef, panRef]}>
        <LoremIpsum words={150} />
        <TapOrPan tapRef={tapRef} panRef={panRef} />
        <LoremIpsum words={150} />
      </LegacyScrollView>
    );
  }
}

const styles = StyleSheet.create({
  horizontalPan: {
    backgroundColor: '#f48fb1',
    height: 150,
    justifyContent: 'center',
    marginVertical: 10,
  },
  circle: {
    backgroundColor: '#42a5f5',
    borderRadius: circleRadius,
    height: circleRadius * 2,
    width: circleRadius * 2,
  },
  wrapper: {
    flex: 1,
  },
});

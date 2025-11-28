import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView as RNScroll,
  Switch,
  Text,
  View,
  Alert,
  TouchableHighlightProps as RNTouchableHighlightProps,
} from 'react-native';

import {
  NativeViewGestureHandler,
  LegacyScrollView as GHScroll,
  State,
  TapGestureHandler,
  TextInput,
  RectButton,
  createNativeWrapper,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';

import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { DraggableBox } from '../../basic/draggable';
import { PinchableBox } from '../../recipes/scaleAndRotate';
import { PressBox } from '../../basic/multitap';

import { LoremIpsum } from '../../common';
import { InfoButton } from './InfoButton';

const WrappedSlider = createNativeWrapper(Slider, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});

type TouchableHighlightProps = RNTouchableHighlightProps & {
  onClick: () => void;
};

type TouchableHighlightState = {
  gestureHandlerState: State;
};

class TouchableHighlight extends Component<
  TouchableHighlightProps,
  TouchableHighlightState
> {
  static defaultProps = {
    activeOpacity: 0.85,
    underlayColor: 'black',
  };
  // private pressedStyle: { opacity?: number };
  constructor(props: TouchableHighlightProps) {
    super(props);
    this.state = { gestureHandlerState: State.UNDETERMINED };
    // this.pressedStyle = {
    //   opacity: this.props.activeOpacity,
    // };
  }
  private onStateChange = (event: TapGestureHandlerStateChangeEvent) => {
    const nextGestureHandlerState = event.nativeEvent.state;
    if (this.state.gestureHandlerState !== nextGestureHandlerState) {
      this.setState({ gestureHandlerState: nextGestureHandlerState });
      if (event.nativeEvent.state === State.ACTIVE && this.props.onClick) {
        this.props.onClick();
      }
    }
  };
  render() {
    const pressed = this.state.gestureHandlerState === State.BEGAN;
    const style = pressed
      ? { backgroundColor: this.props.underlayColor as string }
      : { backgroundColor: 'transparent' };
    return (
      <TapGestureHandler onHandlerStateChange={this.onStateChange}>
        <View style={[this.props.style, style]}>
          <View
            style={{
              opacity:
                this.state.gestureHandlerState === State.BEGAN
                  ? this.props.activeOpacity
                  : 1,
            }}>
            {/* @ts-ignore not typed properly? */}
            {React.cloneElement(React.Children.only(this.props.children))}
          </View>
        </View>
      </TapGestureHandler>
    );
  }
}

type ControlledSwitchProps = {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
};

type ControlledSwitchState = {
  value: boolean;
};

class ControlledSwitch extends React.Component<
  ControlledSwitchProps,
  ControlledSwitchState
> {
  constructor(props: ControlledSwitchProps) {
    super(props);
    this.state = { value: this.props.value || false };
  }
  private onValueChange = (value: boolean) => {
    this.setState({ value });
    this.props.onValueChange?.(value);
  };
  render() {
    return (
      <NativeViewGestureHandler
        hitSlop={20}
        shouldCancelWhenOutside={false}
        shouldActivateOnStart
        disallowInterruption>
        <Switch
          {...this.props}
          value={this.state.value}
          onValueChange={this.onValueChange}
        />
      </NativeViewGestureHandler>
    );
  }
}

type ComboProps = {
  // TODO(TS) what this type can be?
  ScrollViewComponent: React.ComponentType<any>;
};
class Combo extends Component<ComboProps> {
  private onClick = () => {
    Alert.alert("I'm so touched");
    this.scrollView?.scrollTo({ y: 200, animated: true });
  };
  private scrollView: RNScroll | GHScroll | null = null;
  render() {
    const { ScrollViewComponent } = this.props;
    return (
      <View style={styles.container}>
        <ScrollViewComponent
          ref={(node: RNScroll | GHScroll) => (this.scrollView = node)}
          style={styles.scrollView}>
          <TouchableHighlight style={styles.button} onClick={this.onClick}>
            <View style={styles.buttonInner}>
              <Text>Hello</Text>
            </View>
          </TouchableHighlight>
          {/* @ts-ignore Slider is a union type and it seems like TS has some trouble with infering props type */}
          <WrappedSlider style={styles.slider} />
          <TextInput
            style={styles.textinput}
            placeholder="Type something here!"
            underlineColorAndroid="transparent"
          />

          <View style={styles.pinchableContainer}>
            <PinchableBox />
          </View>
          <DraggableBox minDist={100} />
          <PressBox />
          <ControlledSwitch />
          <View style={styles.table}>
            <Swipeable enableTrackpadTwoFingerGesture>
              <RectButton
                style={styles.rectButton}
                onPress={() => Alert.alert('First row clicked')}>
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
              onPress={() => Alert.alert('Second row clicked')}>
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
              style={styles.rectButton}
              onPress={() => Alert.alert('Third row clicked')}>
              <Text style={styles.buttonText}>
                This one will cancel when you drag outside
              </Text>
              {/* Info icon will cancel when you drag your finger outside of its bounds and
                  then back unlike all the previous icons that would activate when you re-enter
                  their activation area. This is a typical bahaviour for android but less frequent
                  for most of the iOS native apps. */}
              <InfoButton shouldCancelWhenOutside name="third" />
            </RectButton>
          </View>
          <LoremIpsum />
        </ScrollViewComponent>
      </View>
    );
  }
}

export const ComboWithGHScroll = () => <Combo ScrollViewComponent={GHScroll} />;
export const ComboWithRNScroll = () => <Combo ScrollViewComponent={RNScroll} />;

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
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: -1,
    marginRight: -1,
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: 'white',
  },
  buttonDelimiter: {
    height: 1,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#999',
  },
  buttonText: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  slider: {
    margin: 10,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  textinput: {
    height: 40,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 3,
    borderRadius: 5,
  },
  button: {
    margin: 20,
  },
  buttonInner: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'red',
  },
  pinchableContainer: {
    width: 250,
    height: 250,
    alignSelf: 'center',
  },
});

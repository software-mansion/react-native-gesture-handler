import React, { Component } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  ScrollView as RNScroll,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  LongPressGestureHandler,
  NativeViewGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  ScrollView as GHScroll,
  Slider,
  State,
  TapGestureHandler,
  TextInput,
  RectButton,
} from 'react-native-gesture-handler';

import { Swipeable, InfoButton } from '../swipeable';
import { DraggableBox } from '../draggable';

import { USE_NATIVE_DRIVER } from '../config';
import { LOREM_IPSUM } from '../common';

const CHILD_REF = 'CHILD_REF';

class TouchableHighlight extends Component {
  static propTypes = View.propTypes;
  static defaultProps = {
    activeOpacity: 0.85,
    underlayColor: 'black',
  };
  constructor(props) {
    super(props);
    this.state = { gestureHandlerState: State.UNDETERMINED };
    this._pressedStyle = {
      opacity: this.props.activeOpacity,
    };
  }
  _onStateChange = event => {
    const nextGestureHandlerState = event.nativeEvent.state;
    if (this.state.gestureHandlerState !== nextGestureHandlerState) {
      this.setState({ gestureHandlerState: nextGestureHandlerState }, () => {
        const pressed = nextGestureHandlerState === State.BEGAN;
        this.refs[CHILD_REF].setNativeProps({
          style: pressed
            ? { opacity: this.props.activeOpacity }
            : INACTIVE_CHILD_STYLE,
        });
      });
      if (event.nativeEvent.state === State.ACTIVE && this.props.onClick) {
        this.props.onClick();
      }
    }
  };
  render() {
    const pressed = this.state.gestureHandlerState === State.BEGAN;
    const style = pressed
      ? { backgroundColor: this.props.underlayColor }
      : INACTIVE_UNDERLAY_STYLE;
    return (
      <TapGestureHandler onHandlerStateChange={this._onStateChange}>
        <View style={[this.props.style, style]}>
          {React.cloneElement(React.Children.only(this.props.children), {
            ref: CHILD_REF,
          })}
        </View>
      </TapGestureHandler>
    );
  }
}

var INACTIVE_CHILD_STYLE = StyleSheet.create({ x: { opacity: 1.0 } }).x;
const INACTIVE_UNDERLAY_STYLE = StyleSheet.create({
  x: { backgroundColor: 'transparent' },
}).x;

class PressBox extends Component {
  _onHandlerStateChange = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("I'm being pressed for so long");
    }
  };
  _onSingleTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("I'm touched");
    }
  };
  _onDoubleTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert('D0able tap, good job!');
    }
  };
  render() {
    return (
      <LongPressGestureHandler
        onHandlerStateChange={this._onHandlerStateChange}
        minDurationMs={1500}>
        <TapGestureHandler
          onHandlerStateChange={this._onSingleTap}
          waitFor="double_tap">
          <TapGestureHandler
            id="double_tap"
            onHandlerStateChange={this._onDoubleTap}
            numberOfTaps={2}>
            <View style={styles.box} />
          </TapGestureHandler>
        </TapGestureHandler>
      </LongPressGestureHandler>
    );
  }
}

class ControlledSwitch extends React.Component {
  static propTypes = Switch.propTypes;
  constructor(props) {
    super(props);
    this.state = { value: this.props.value || false };
  }
  _onValueChange = value => {
    this.setState({ value });
    this.props.onValueChange && this.props.onValueChange(value);
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
          onValueChange={this._onValueChange}
        />
      </NativeViewGestureHandler>
    );
  }
}

class PinchableBox extends React.Component {
  constructor(props) {
    super(props);

    /* Pinching */
    this._baseScale = new Animated.Value(1);
    this._pinchScale = new Animated.Value(1);
    this._scale = Animated.multiply(this._baseScale, this._pinchScale);
    this._lastScale = 1;
    this._onPinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this._pinchScale } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    /* Rotation */
    this._rotate = new Animated.Value(0);
    this._rotateStr = this._rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    this._lastRotate = 0;
    this._onRotateGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: this._rotate } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    /* Tilt */
    this._tilt = new Animated.Value(0);
    this._tiltStr = this._tilt.interpolate({
      inputRange: [-501, -500, 0, 1],
      outputRange: ['1rad', '1rad', '0rad', '0rad'],
    });
    this._lastTilt = 0;
    this._onTiltGestureEvent = Animated.event(
      [{ nativeEvent: { translationY: this._tilt } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  _onRotateHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastRotate += event.nativeEvent.rotation;
      this._rotate.setOffset(this._lastRotate);
      this._rotate.setValue(0);
    }
  };
  _onPinchHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
    }
  };
  _onTiltGestureStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastTilt += event.nativeEvent.translationY;
      this._tilt.setOffset(this._lastTilt);
      this._tilt.setValue(0);
    }
  };
  render() {
    return (
      <Animated.View style={styles.pinchableBoxContainer} collapsable={false}>
        <PanGestureHandler
          id="image_tilt"
          onGestureEvent={this._onTiltGestureEvent}
          onHandlerStateChange={this._onTiltGestureStateChange}
          minDist={10}
          minPointers={2}
          maxPointers={2}
          avgTouches>
          <RotationGestureHandler
            id="image_rotation"
            simultaneousHandlers="image_pinch"
            onGestureEvent={this._onRotateGestureEvent}
            onHandlerStateChange={this._onRotateHandlerStateChange}>
            <PinchGestureHandler
              id="image_pinch"
              simultaneousHandlers="image_rotation"
              onGestureEvent={this._onPinchGestureEvent}
              onHandlerStateChange={this._onPinchHandlerStateChange}>
              <Animated.Image
                style={[
                  styles.pinchableImage,
                  {
                    transform: [
                      { perspective: 200 },
                      { scale: this._scale },
                      { rotate: this._rotateStr },
                      { rotateX: this._tiltStr },
                    ],
                  },
                ]}
                source={{
                  uri: 'https://avatars1.githubusercontent.com/u/6952717',
                }}
              />
            </PinchGestureHandler>
          </RotationGestureHandler>
        </PanGestureHandler>
      </Animated.View>
    );
  }
}

class Combo extends Component {
  _onClick = () => {
    Alert.alert("I'm so touched");
  };
  render() {
    const { ScrollViewComponent } = this.props;
    return (
      <View style={styles.container}>
        <ScrollViewComponent
          waitFor={['dragbox', 'image_pinch', 'image_rotation', 'image_tilt']}
          style={styles.scrollView}>
          <TouchableHighlight style={styles.button} onClick={this._onClick}>
            <View style={styles.buttonInner}>
              <Text>Hello</Text>
            </View>
          </TouchableHighlight>
          <Slider style={styles.slider} />
          <TextInput
            style={styles.textinput}
            placeholder="Type something here!"
            underlineColorAndroid="transparent"
          />

          <PinchableBox />
          <DraggableBox minDist={100} />
          <PressBox />
          <ControlledSwitch />
          <View style={styles.table}>
            <Swipeable>
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
          <Text style={styles.text}>
            {LOREM_IPSUM}
          </Text>
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
    backgroundColor: '#F5FCFF',
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
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
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
  text: {
    margin: 10,
  },
  pinchableBoxContainer: {
    width: 250,
    height: 250,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: 'black',
  },
  pinchableImage: {
    flex: 1,
  },
});

import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView as RNScroll,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  NativeViewGestureHandler,
  ScrollView as GHScroll,
  State,
  TapGestureHandler,
  TextInput,
  RectButton,
  createNativeWrapper,
} from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';

import { Swipeable, InfoButton } from '../rows';
import { DraggableBox } from '../draggable';
import { PinchableBox } from '../scaleAndRotate';
import { PressBox } from '../multitap';

import { LoremIpsum } from '../common';

const CHILD_REF = 'CHILD_REF';

const WrappedSlider = createNativeWrapper(Slider, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});

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

class Combo extends Component {
  _onClick = () => {
    alert("I'm so touched");
    this._scrollView.scrollTo({ y: 200, animated: true });
  };
  render() {
    const { ScrollViewComponent } = this.props;
    return (
      <View style={styles.container}>
        <ScrollViewComponent
          ref={node => (this._scrollView = node)}
          waitFor={['dragbox', 'image_pinch', 'image_rotation', 'image_tilt']}
          style={styles.scrollView}>
          <TouchableHighlight style={styles.button} onClick={this._onClick}>
            <View style={styles.buttonInner}>
              <Text>Hello</Text>
            </View>
          </TouchableHighlight>
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
                onPress={() => alert('First row clicked')}>
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
              onPress={() => alert('Second row clicked')}>
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
              onPress={() => alert('Third row clicked')}>
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

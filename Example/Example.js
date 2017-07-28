import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AppRegistry,
  StyleSheet,
  Switch,
  Text,
  View,
  Image,
  // ScrollView,
  Platform,
} from 'react-native';

import {
  LongPressGestureHandler,
  NativeViewGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  ScrollView,
  Slider,
  State,
  TapGestureHandler,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
  RectButton,
  BorderlessButton,
} from 'react-native-gesture-handler';

const UNDERLAY_REF = 'UNDERLAY_REF';
const CHILD_REF = 'CHILD_REF';

class TouchableHighlight extends Component {
  static propTypes = View.propTypes;
  static defaultProps = {
    activeOpacity: 0.85,
    underlayColor: 'black',
  }
  constructor(props) {
    super(props);
    this.state = { gestureHandlerState: State.UNDETERMINED }
    this._pressedStyle = {
      opacity: this.props.activeOpacity,
    }
  }
  _onStateChange = (event) => {
    const nextGestureHandlerState = event.nativeEvent.state;
    if (this.state.gestureHandlerState !== nextGestureHandlerState) {
      this.setState({ gestureHandlerState: nextGestureHandlerState }, () => {
        const pressed = nextGestureHandlerState === State.BEGAN;
        this.refs[CHILD_REF].setNativeProps(
          { style: pressed ? { opacity: this.props.activeOpacity } : INACTIVE_CHILD_STYLE }
        );
      });
      if (event.nativeEvent.state === State.ACTIVE && this.props.onClick) {
        this.props.onClick();
      }
    }
  }
  render() {
    const pressed = this.state.gestureHandlerState === State.BEGAN;
    const style = pressed ? { backgroundColor: this.props.underlayColor } : INACTIVE_UNDERLAY_STYLE;
    return (
      <TapGestureHandler onHandlerStateChange={this._onStateChange}>
        <View style={[this.props.style, style]}>
          {React.cloneElement(React.Children.only(this.props.children), { ref: CHILD_REF })}
        </View>
      </TapGestureHandler>
    );
  }
}

var INACTIVE_CHILD_STYLE = StyleSheet.create({x: {opacity: 1.0}}).x;
const INACTIVE_UNDERLAY_STYLE = StyleSheet.create({x: {backgroundColor: 'transparent'}}).x;

class DraggableBox extends Component {
  constructor(props) {
    super(props);
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._lastOffset = { x: 0, y: 0 }
    this._onGestureEvent = Animated.event(
       [{ nativeEvent: { translationX: this._translateX, translationY: this._translateY }}],
       { useNativeDriver: true }
    )
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX;
      this._lastOffset.y += event.nativeEvent.translationY;
      this._translateX.setOffset(this._lastOffset.x);
      this._translateX.setValue(0);
      this._translateY.setOffset(this._lastOffset.y);
      this._translateY.setValue(0);
    }
  }
  render() {
    return (
      <PanGestureHandler
          {...this.props}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
          minDist={100}
          id="dragbox">
        <Animated.View style={[styles.box, { transform: [
          {translateX: this._translateX},
          {translateY: this._translateY}
        ]}]}/>
      </PanGestureHandler>
    );
  }
}

class PressBox extends Component {
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("I'm being pressed for so long");
    }
  }
  _onSingleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("I'm touched");
    }
  }
  _onDoubleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("D0able tap, good job!");
    }
  }
  render() {
    return (
      <LongPressGestureHandler onHandlerStateChange={this._onHandlerStateChange} minDurationMs={1500}>
        <TapGestureHandler onHandlerStateChange={this._onSingleTap} waitFor="double_tap">
          <TapGestureHandler
            id="double_tap"
            onHandlerStateChange={this._onDoubleTap}
            numberOfTaps={2}>
            <View style={styles.box}/>
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
    this.state = { value: this.props.value || false }
  }
  _onValueChange = (value) => {
    this.setState({ value });
    this.props.onValueChange && this.props.onValueChange(value);
  }
  render() {
    return (
      <NativeViewGestureHandler hitSlop={20} shouldCancelWhenOutside={false} shouldActivateOnStart disallowInterruption>
        <Switch {...this.props} value={this.state.value} onValueChange={this._onValueChange} />
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
       [{ nativeEvent: { scale: this._pinchScale }}],
      //  { useNativeDriver: true }
    );

    /* Rotation */
    this._rotate = new Animated.Value(0);
    this._rotateStr = this._rotate.interpolate({ inputRange: [-100, 100], outputRange: ['-100rad', '100rad'] });
    this._lastRotate = 0;
    this._onRotateGestureEvent = Animated.event(
       [{ nativeEvent: { rotation: this._rotate }}],
      //  { useNativeDriver: true }
    );

    /* Tilt */
    this._tilt = new Animated.Value(0);
    this._tiltStr = this._tilt.interpolate({ inputRange: [-501, -500, 0, 1], outputRange: ['1rad', '1rad', '0rad', '0rad']});
    this._lastTilt = 0;
    this._onTiltGestureEvent = Animated.event(
      [{ nativeEvent: { translationY: this._tilt }}],
      //  { useNativeDriver: true }
    );
  }
  _onRotateHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastRotate += event.nativeEvent.rotation;
      this._rotate.setOffset(this._lastRotate);
      this._rotate.setValue(0);
    }
  }
  _onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
    }
  }
  _onTiltGestureStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastTilt += event.nativeEvent.translationY;
      this._tilt.setOffset(this._lastTilt);
      this._tilt.setValue(0);
    }
  }
  render() {
    return (
      <Animated.View style={styles.pinchableBoxContainer} collapsable={false}>
        <PanGestureHandler
          id="image_tilt"
          onGestureEvent={this._onTiltGestureEvent}
          onHandlerStateChange={this._onTiltGestureStateChange}
          minDist={10}
          minPointers={2}
          maxPointers={2}>
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
                style={[styles.pinchableImage, { transform: [
                  { perspective: 200 },
                  { scale: this._scale },
                  { rotate: this._rotateStr },
                  { rotateX: this._tiltStr },
                ] }]}
                source={{uri: 'https://avatars1.githubusercontent.com/u/6952717'}}/>
            </PinchGestureHandler>
          </RotationGestureHandler>
        </PanGestureHandler>
      </Animated.View>
    )
  }
}

const InfoButton = (props) => (
  <BorderlessButton {...props} style={styles.infoButton} onPress={() => Alert.alert(`${props.name} info button clicked`)}>
    <View style={styles.infoButtonBorders}>
      <Text style={styles.infoButtonText}>i</Text>
    </View>
  </BorderlessButton>
)

export default class Example extends Component {
  _onClick = () => {
    Alert.alert("I'm so touched");
  }
  render2() {
    const navigationView = (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <Text style={{margin: 10, fontSize: 15, textAlign: 'left'}}>I'm in the Drawer!</Text>
      </View>
    );
    return (
      <ViewPagerAndroid style={styles.container} waitFor={["drawer_blocker", "drawer2_blocker"]}>
        <View>
          <DrawerLayoutAndroid
            simultaneousHandlers="drawer_blocker"
            drawerWidth={200}
            drawerPosition={DrawerLayoutAndroid.positions.Left}
            renderNavigationView={() => navigationView}>
            <View style={{flex: 1, backgroundColor: 'gray'}}/>
          </DrawerLayoutAndroid>
          <PanGestureHandler id="drawer_blocker" hitSlop={{right: 100}}>
            <View style={{position: 'absolute', width: 0, top: 0, bottom: 0}} />
          </PanGestureHandler>
        </View>
        <View style={{backgroundColor: 'yellow'}}/>
        <View style={{backgroundColor: 'blue'}}/>
        <View>
          <DrawerLayoutAndroid
            simultaneousHandlers="drawer2_blocker"
            drawerWidth={200}
            drawerPosition={DrawerLayoutAndroid.positions.Right}
            renderNavigationView={() => navigationView}>
            <View style={{flex: 1, backgroundColor: 'plum'}}/>
          </DrawerLayoutAndroid>
          <PanGestureHandler id="drawer2_blocker" hitSlop={{left: 100}}>
            <View style={{position: 'absolute', width: 0, top: 0, bottom: 0, right: 0}} />
          </PanGestureHandler>
        </View>
      </ViewPagerAndroid>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <ScrollView waitFor={["dragbox", "image_pinch", "image_rotation", "image_tilt"]} style={styles.scrollView}>
          <TouchableHighlight style={styles.button} onClick={this._onClick}>
            <View style={styles.buttonInner}>
              <Text>Hello</Text>
            </View>
          </TouchableHighlight>
          <Slider style={styles.slider} />

          <PinchableBox/>
          <DraggableBox/>
          <PressBox/>
          <ControlledSwitch/>
          <View style={styles.table}>
            <RectButton style={styles.rectButton} onPress={() => Alert.alert('First row clicked')}>
              <Text style={styles.buttonText}>Observe highlight delay on the row</Text>
              {/* Info icon will cancel when you scroll in the direction of the scrollview
                  but if you move finger horizontally it would allow you to "re-enter" into
                  an active state. This is typical for most of the buttons on iOS (but not
                  on Android where the touch cancels as soon as you leave the area of the
                  button). */}
              <InfoButton name="first" />
            </RectButton>
            <View style={styles.buttonDelimiter} />
            <RectButton style={styles.rectButton} onPress={() => Alert.alert('Second row clicked')}>
              <Text style={styles.buttonText}>Second info icon will block scrolling</Text>
              {/* Info icon will block interaction with other gesture handlers including
                  the scrollview handler its a descendant of. This is typical for buttons
                  embedded in a scrollable content on iOS. */}
              <InfoButton disallowInterruption name="second"/>
            </RectButton>
            <View style={styles.buttonDelimiter} />
            <RectButton style={styles.rectButton} onPress={() => Alert.alert('Third row clicked')}>
              <Text style={styles.buttonText}>This one will cancel when you drag outside</Text>
              {/* Info icon will cancel when you drag your finger outside of its bounds and
                  then back unlike all the previous icons that would activate when you re-enter
                  their activation area. This is a typical bahaviour for android but less frequent
                  for most of the iOS native apps. */}
              <InfoButton shouldCancelWhenOutside name="third"/>
            </RectButton>
          </View>
          <Text style={styles.text}>
            {LOREM_IPSUM}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: (Platform.OS === 'ios') ? 20 : 0,
    justifyContent: 'center',
    alignItems: 'center',
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
  slider: {
    margin: 10,
    flex: 1,
  },
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
  button: {
    margin: 20,
  },
  buttonInner: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'red',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  text: {
    margin: 10,
  },
  toolbar: {
    backgroundColor: '#e9eaed',
    height: 56,
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

const LOREM_IPSUM = `
Curabitur accumsan sit amet massa quis cursus. Fusce sollicitudin nunc nisl, quis efficitur quam tristique eget. Ut non erat molestie, ullamcorper turpis nec, euismod neque. Praesent aliquam risus ultricies, cursus mi consectetur, bibendum lorem. Nunc eleifend consectetur metus quis pulvinar. In vitae lacus eu nibh tincidunt sagittis ut id lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque sagittis mauris rhoncus, maximus justo in, consequat dolor. Pellentesque ornare laoreet est vulputate vestibulum. Aliquam sit amet metus lorem.

Morbi tempus elit lorem, ut pulvinar nunc sagittis pharetra. Nulla mi sem, elementum non bibendum eget, viverra in purus. Vestibulum efficitur ex id nisi luctus egestas. Quisque in urna vitae leo consectetur ultricies sit amet at nunc. Cras porttitor neque at nisi ornare, mollis ornare dolor pharetra. Donec iaculis lacus orci, et pharetra eros imperdiet nec. Morbi leo nunc, placerat eget varius nec, volutpat ac velit. Phasellus pulvinar vulputate tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce elementum dui at ipsum hendrerit, vitae consectetur erat pulvinar. Sed vehicula sapien felis, id tristique dolor tempor feugiat. Aenean sit amet erat libero.

Nam posuere at mi ut porttitor. Vivamus dapibus vehicula mauris, commodo pretium nibh. Mauris turpis metus, vulputate iaculis nibh eu, maximus tincidunt nisl. Vivamus in mauris nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse convallis ornare finibus. Quisque leo ex, vulputate quis molestie auctor, congue nec arcu.

Praesent ac risus nec augue commodo semper eu eget quam. Donec aliquam sodales convallis. Etiam interdum eu nulla at tempor. Duis nec porttitor odio, consectetur tempor turpis. Sed consequat varius lorem vel fermentum. Maecenas dictum sapien vitae lobortis tempus. Aliquam iaculis vehicula velit, non tempus est varius nec. Nunc congue dolor nec sem gravida, nec tincidunt mi luctus. Nam ut porttitor diam.

Fusce interdum nisi a risus aliquet, non dictum metus cursus. Praesent imperdiet sapien orci, quis sodales metus aliquet id. Aliquam convallis pharetra erat. Fusce gravida diam ut tellus elementum sodales. Fusce varius congue neque, quis laoreet sapien blandit vestibulum. Donec congue libero sapien, nec varius risus viverra ut. Quisque eu maximus magna. Phasellus tortor nisi, tincidunt vitae dignissim nec, interdum vel mi. Ut accumsan urna finibus posuere mattis.
`

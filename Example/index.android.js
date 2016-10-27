import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Animated,
  ToastAndroid,
} from 'react-native';

import {
  LongPressGestureHandler,
  PanGestureHandler,
  ScrollView,
  Slider,
  State,
  Switch,
  TapGestureHandler,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  WebView,
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
       // { useNativeDriver: true }
    )
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.lastTranslationX;
      this._lastOffset.y += event.nativeEvent.lastTranslationY;
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
          shouldCancelOthersWhenActivated={true}>
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
      ToastAndroid.show("I'm being pressed for so long", ToastAndroid.SHORT);
    }
  }
  _onTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      ToastAndroid.show("I'm touched", ToastAndroid.SHORT);
    }
  }
  render() {
    return (
      <LongPressGestureHandler onHandlerStateChange={this._onHandlerStateChange}>
        <TapGestureHandler onHandlerStateChange={this._onTap}>
          <View style={styles.box}/>
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
    return <Switch {...this.props} value={this.state.value} onValueChange={this._onValueChange} />
  }
}

export default class Example extends Component {
  _onClick = () => {
    ToastAndroid.show("I'm so touched", ToastAndroid.SHORT);
  }
  render2() {
    return (
      <ViewPagerAndroid style={styles.container}>
        <View style={{backgroundColor: 'red'}}/>
        <View style={{backgroundColor: 'blue'}}/>
      </ViewPagerAndroid>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <TouchableHighlight style={styles.button} onClick={this._onClick}>
            <View style={styles.buttonInner}>
              <Text>Hello</Text>
            </View>
          </TouchableHighlight>
          <Slider style={styles.slider} />
          <DraggableBox/>
          <PressBox/>
          <ControlledSwitch/>
          <Text style={styles.text}>
            {LOREM_IPSUM}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  slider: {
    margin: 10,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  box: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
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
});

AppRegistry.registerComponent('Example', () => Example);

const LOREM_IPSUM = `
Curabitur accumsan sit amet massa quis cursus. Fusce sollicitudin nunc nisl, quis efficitur quam tristique eget. Ut non erat molestie, ullamcorper turpis nec, euismod neque. Praesent aliquam risus ultricies, cursus mi consectetur, bibendum lorem. Nunc eleifend consectetur metus quis pulvinar. In vitae lacus eu nibh tincidunt sagittis ut id lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque sagittis mauris rhoncus, maximus justo in, consequat dolor. Pellentesque ornare laoreet est vulputate vestibulum. Aliquam sit amet metus lorem.

Morbi tempus elit lorem, ut pulvinar nunc sagittis pharetra. Nulla mi sem, elementum non bibendum eget, viverra in purus. Vestibulum efficitur ex id nisi luctus egestas. Quisque in urna vitae leo consectetur ultricies sit amet at nunc. Cras porttitor neque at nisi ornare, mollis ornare dolor pharetra. Donec iaculis lacus orci, et pharetra eros imperdiet nec. Morbi leo nunc, placerat eget varius nec, volutpat ac velit. Phasellus pulvinar vulputate tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce elementum dui at ipsum hendrerit, vitae consectetur erat pulvinar. Sed vehicula sapien felis, id tristique dolor tempor feugiat. Aenean sit amet erat libero.

Nam posuere at mi ut porttitor. Vivamus dapibus vehicula mauris, commodo pretium nibh. Mauris turpis metus, vulputate iaculis nibh eu, maximus tincidunt nisl. Vivamus in mauris nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse convallis ornare finibus. Quisque leo ex, vulputate quis molestie auctor, congue nec arcu.

Praesent ac risus nec augue commodo semper eu eget quam. Donec aliquam sodales convallis. Etiam interdum eu nulla at tempor. Duis nec porttitor odio, consectetur tempor turpis. Sed consequat varius lorem vel fermentum. Maecenas dictum sapien vitae lobortis tempus. Aliquam iaculis vehicula velit, non tempus est varius nec. Nunc congue dolor nec sem gravida, nec tincidunt mi luctus. Nam ut porttitor diam.

Fusce interdum nisi a risus aliquet, non dictum metus cursus. Praesent imperdiet sapien orci, quis sodales metus aliquet id. Aliquam convallis pharetra erat. Fusce gravida diam ut tellus elementum sodales. Fusce varius congue neque, quis laoreet sapien blandit vestibulum. Donec congue libero sapien, nec varius risus viverra ut. Quisque eu maximus magna. Phasellus tortor nisi, tincidunt vitae dignissim nec, interdum vel mi. Ut accumsan urna finibus posuere mattis.
`

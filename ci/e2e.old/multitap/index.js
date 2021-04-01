import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';

import {
  LongPressGestureHandler,
  ScrollView,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { LoremIpsum } from '../common';

export class PressBox extends Component {
  state = {
    lastGH: false,
  };
  doubleTapRef = React.createRef();
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("I'm being pressed for so long");
      this.setState({
        lastGH: 'Long press',
      });
    }
  };
  _onSingleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("I'm touched");
      this.setState({
        lastGH: 'Single tap',
      });
    }
  };
  _onDoubleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert('Double tap, good job!');
      this.setState({
        lastGH: 'Double tap',
      });
    }
  };
  render() {
    return (
      <View>
        <LongPressGestureHandler
          onHandlerStateChange={this._onHandlerStateChange}
          minDurationMs={800}>
          <TapGestureHandler
            onHandlerStateChange={this._onSingleTap}
            waitFor={this.doubleTapRef}>
            <TapGestureHandler
              ref={this.doubleTapRef}
              onHandlerStateChange={this._onDoubleTap}
              numberOfTaps={2}>
              <View style={styles.box} testID="rectangle" />
            </TapGestureHandler>
          </TapGestureHandler>
        </LongPressGestureHandler>
        {this.state.lastGH && (
          <Text>{`${this.state.lastGH} has been activated`}</Text>
        )}
      </View>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <LoremIpsum words={40} />
        <PressBox />
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
});

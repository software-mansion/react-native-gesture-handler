import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';

import { CustomGestureHandler, State } from 'react-native-gesture-handler';

export default class Example extends Component {
  state = {
    level: 0,
    state: 'UNDETERMINED',
  };
  points = [
    { x: 150, y: 50 },
    { x: 221, y: 79 },
    { x: 250, y: 150 },
    { x: 221, y: 221 },
    { x: 150, y: 250 },
    { x: 79, y: 221 },
    { x: 50, y: 150 },
    { x: 79, y: 79 },
  ];
  parseEvent = ({ nativeEvent }, sm) => {
    if (
      Math.pow(nativeEvent.x - this.points[this.state.level].x, 2) +
        Math.pow(nativeEvent.y - this.points[this.state.level].y, 2) <
      700
    ) {
      if (nativeEvent.state === State.BEGAN) {
        if (!this.timeout) {
          this.timeout = setTimeout(() => {
            sm.cancel();
            Alert.alert('Meh...', "You're so slow ¯\\_(ツ)_/¯");
            clearTimeout(this.timeout);
            this.timeout = false;
          }, 2000);
        }
        this.setState({ level: (this.state.level + 1) % 8 });
      }
      if (this.state.level === 7) {
        clearTimeout(this.timeout);
        this.timeout = false;
        sm.activate();
        sm.end();
      }
    }
  };

  parseState = ({ nativeEvent: { state, oldState } }) => {
    this.setState({
      state: Object.keys(State).find(key => State[key] === state),
    });
    if (oldState === State.ACTIVE) {
      Alert.alert('Yay!');
      clearTimeout(this.timeout);
      this.timeout = false;
    }
    if (state === State.FAILED || state === State.CANCELLED) {
      this.setState({ level: 0 });
      clearTimeout(this.timeout);
      this.timeout = false;
    }
  };

  render() {
    return (
      <View style={styles.scrollView}>
        <Text>Draw circle fast starting from the top</Text>
        <CustomGestureHandler
          shouldCancelWhenOutside
          handleEvents={this.parseEvent}
          onHandlerStateChange={this.parseState}>
          <View style={styles.ghspace}>
            {this.points.map((p, i) => (
              <View
                key={`point${i}`}
                style={[
                  styles.circle,
                  {
                    top: p.y,
                    left: p.x,
                    backgroundColor: this.state.level >= i ? 'blue' : 'black',
                  },
                ]}
              />
            ))}
          </View>
        </CustomGestureHandler>
        <Text>{this.state.level + 1} / 8</Text>
        <Text>{this.state.state}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  circle: {
    width: 10,
    height: 10,
    position: 'absolute',
    borderRadius: 5,
  },
  ghspace: {
    backgroundColor: 'red',
    width: 400,
    height: 400,
  },
  scrollView: {
    flex: 1,
  },
});

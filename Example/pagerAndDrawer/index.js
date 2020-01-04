import React, { Component } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

export default class Example extends Component {
  static platforms = ['android'];
  render() {
    return <Text>Sorry, this is a demo of android-only native components</Text>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  page: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageText: {
    fontSize: 21,
    color: 'white',
  },
});

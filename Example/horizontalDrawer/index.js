import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';

import DrawerLayout from './DrawerLayout';

const Page = ({ fromLeft, onPress }) => (
  <View style={styles.page}>
    <Text style={styles.pageText}>Hi 👋</Text>
    <RectButton style={styles.rectButton} onPress={onPress}>
      <Text style={styles.rectButtonText}>
        Drawer to the {fromLeft ? 'left' : 'right'}! Flip
      </Text>
    </RectButton>
    <TextInput
      style={styles.pageInput}
      placeholder="Just an input field to test kb dismiss mode"
    />
  </View>
);

export default class Example extends Component {
  state = { fromLeft: true };

  render() {
    const drawerView = (
      <View style={styles.drawerContainer}>
        <Text style={styles.drawerText}>In the drawer!</Text>
      </View>
    );
    return (
      <View style={styles.container}>
        <DrawerLayout
          drawerWidth={200}
          keyboardDismissMode="on-drag"
          drawerPosition={
            this.state.fromLeft
              ? DrawerLayout.positions.Left
              : DrawerLayout.positions.Right
          }
          renderNavigationView={() => drawerView}>
          <Page
            fromLeft={this.state.fromLeft}
            onPress={() => this.setState({ fromLeft: !this.state.fromLeft })}
          />
        </DrawerLayout>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: 'gray',
  },
  pageText: {
    fontSize: 21,
    color: 'white',
  },
  rectButton: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
  },
  rectButtonText: {
    backgroundColor: 'transparent',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  pageInput: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#ddd',
  },
  drawerText: {
    margin: 10,
    fontSize: 15,
    textAlign: 'left',
  },
});

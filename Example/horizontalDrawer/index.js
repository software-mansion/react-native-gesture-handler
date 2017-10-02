import React, { Component } from 'react';
import { StyleSheet, Text, Animated, View, TextInput } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';

import DrawerLayout from './DrawerLayout';

const TYPES = ['front', 'back', 'back', 'slide'];
const PARALLAX = [false, false, true, false];

const Page = ({ fromLeft, type, parallaxOn, flipSide, nextType }) => (
  <View style={styles.page}>
    <Text style={styles.pageText}>Hi 👋</Text>
    <RectButton style={styles.rectButton} onPress={flipSide}>
      <Text style={styles.rectButtonText}>
        Drawer to the {fromLeft ? 'left' : 'right'}! -> Flip
      </Text>
    </RectButton>
    <RectButton style={styles.rectButton} onPress={nextType}>
      <Text style={styles.rectButtonText}>
        Type '{type}
        {parallaxOn && ' with parallax'}'! -> Next
      </Text>
    </RectButton>
    <TextInput
      style={styles.pageInput}
      placeholder="Just an input field to test kb dismiss mode"
    />
  </View>
);

export default class Example extends Component {
  state = { fromLeft: true, type: 0 };

  renderParallaxDrawer = progressValue => {
    const parallax = progressValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this.state.fromLeft ? -50 : 50, 0],
    });
    const animatedStyles = {
      transform: [{ translateX: parallax }],
    };
    return (
      <Animated.View style={[styles.drawerContainer, animatedStyles]}>
        <Text style={styles.drawerText}>I am in the drawer!</Text>
        <Text style={styles.drawerText}>
          Watch parallax animation while you pull the drawer!
        </Text>
      </Animated.View>
    );
  };

  renderDrawer = () => {
    return (
      <View style={styles.drawerContainer}>
        <Text style={styles.drawerText}>I am in the drawer!</Text>
      </View>
    );
  };

  render() {
    const drawerType = TYPES[this.state.type];
    const parallax = PARALLAX[this.state.type];
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
          drawerType={TYPES[this.state.type]}
          drawerBackgroundColor="#ddd"
          renderNavigationView={
            parallax ? this.renderParallaxDrawer : this.renderDrawer
          }>
          <Page
            type={drawerType}
            fromLeft={this.state.fromLeft}
            parallaxOn={parallax}
            flipSide={() => this.setState({ fromLeft: !this.state.fromLeft })}
            nextType={() =>
              this.setState({ type: (this.state.type + 1) % TYPES.length })}
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
    paddingTop: 40,
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
  },
  pageInput: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#eee',
  },
  drawerText: {
    margin: 10,
    fontSize: 15,
    textAlign: 'left',
  },
});

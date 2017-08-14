import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

import {
  PanGestureHandler,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
} from 'react-native-gesture-handler';

const Page = ({ backgroundColor, text }) =>
  <View style={[styles.page, { backgroundColor }]}>
    <Text style={styles.pageText}>
      {text}
    </Text>
  </View>;

export default class Example extends Component {
  render() {
    if (Platform.OS !== 'android') {
      return (
        <Text>Sorry, this is a demo of android-only native components</Text>
      );
    }
    const navigationView = (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text style={{ margin: 10, fontSize: 15, textAlign: 'left' }}>
          I'm in the Drawer!
        </Text>
      </View>
    );
    return (
      <ViewPagerAndroid
        style={styles.container}
        waitFor={['drawer_blocker', 'drawer2_blocker']}>
        <View>
          <DrawerLayoutAndroid
            simultaneousHandlers="drawer_blocker"
            drawerWidth={200}
            drawerPosition={DrawerLayoutAndroid.positions.Left}
            renderNavigationView={() => navigationView}>
            <Page backgroundColor="gray" text="First 🙈" />
          </DrawerLayoutAndroid>
          <PanGestureHandler id="drawer_blocker" hitSlop={{ right: 100 }}>
            <View
              style={{ position: 'absolute', width: 0, top: 0, bottom: 0 }}
            />
          </PanGestureHandler>
        </View>
        <Page backgroundColor="yellow" text="Second 🙉" />
        <Page backgroundColor="blue" text="Third 🙊" />
        <View>
          <DrawerLayoutAndroid
            simultaneousHandlers="drawer2_blocker"
            drawerWidth={200}
            drawerPosition={DrawerLayoutAndroid.positions.Right}
            renderNavigationView={() => navigationView}>
            <Page backgroundColor="blue" text="Fourth 😎" />
          </DrawerLayoutAndroid>
          <PanGestureHandler id="drawer2_blocker" hitSlop={{ left: 100 }}>
            <View
              style={{
                position: 'absolute',
                width: 0,
                top: 0,
                bottom: 0,
                right: 0,
              }}
            />
          </PanGestureHandler>
        </View>
      </ViewPagerAndroid>
    );
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

import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, Platform } from 'react-native';

import {
  PanGestureHandler,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
} from 'react-native-gesture-handler';

export default class Example extends Component {
  _onClick = () => {
    Alert.alert("I'm so touched");
  };
  render() {
    if (Platform.OS !== 'android') {
      return (
        <Text>Sorry, thisis a demo of android-only native components</Text>
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
            <View style={{ flex: 1, backgroundColor: 'gray' }} />
          </DrawerLayoutAndroid>
          <PanGestureHandler id="drawer_blocker" hitSlop={{ right: 100 }}>
            <View
              style={{ position: 'absolute', width: 0, top: 0, bottom: 0 }}
            />
          </PanGestureHandler>
        </View>
        <View style={{ backgroundColor: 'yellow' }} />
        <View style={{ backgroundColor: 'blue' }} />
        <View>
          <DrawerLayoutAndroid
            simultaneousHandlers="drawer2_blocker"
            drawerWidth={200}
            drawerPosition={DrawerLayoutAndroid.positions.Right}
            renderNavigationView={() => navigationView}>
            <View style={{ flex: 1, backgroundColor: 'plum' }} />
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
});

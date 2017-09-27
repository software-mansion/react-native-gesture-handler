import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';

import DrawerLayout from './DrawerLayout';

const Page = () => (
  <View style={styles.page}>
    <Text style={styles.pageText}>Hi 👋</Text>
    <RectButton style={styles.rectButton}>
      <Text style={styles.rectButtonText}>Very wide button</Text>
    </RectButton>
  </View>
);

export default class Example extends Component {
  render() {
    const navigationView = (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text style={{ margin: 10, fontSize: 15, textAlign: 'left' }}>
          I'm in the Drawer!
        </Text>
      </View>
    );
    return (
      <View style={styles.container}>
        <DrawerLayout
          drawerWidth={200}
          drawerPosition={DrawerLayout.positions.Left}
          renderNavigationView={() => navigationView}>
          <Page />
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
    justifyContent: 'center',
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
});

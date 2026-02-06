import ViewPagerAndroid from '@react-native-community/viewpager';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createNativeWrapper,
  LegacyDrawerLayoutAndroid,
} from 'react-native-gesture-handler';

const WrappedViewPagerAndroid = createNativeWrapper(ViewPagerAndroid, {
  disallowInterruption: true,
});

const Page = ({
  backgroundColor,
  text,
}: {
  backgroundColor: string;
  text: string;
}) => (
  <View style={[styles.page, { backgroundColor }]}>
    <Text style={styles.pageText}>{text}</Text>
  </View>
);

export default class Example extends Component {
  static platforms = ['android'];
  render() {
    const navigationView = (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text style={{ margin: 10, fontSize: 15, textAlign: 'left' }}>
          I&apos;m in the Drawer!
        </Text>
      </View>
    );
    return (
      <WrappedViewPagerAndroid style={styles.container}>
        <View>
          <LegacyDrawerLayoutAndroid
            drawerWidth={200}
            drawerPosition="left"
            renderNavigationView={() => navigationView}>
            <Page backgroundColor="gray" text="First 🙈" />
          </LegacyDrawerLayoutAndroid>
        </View>
        <Page backgroundColor="yellow" text="Second 🙉" />
        <Page backgroundColor="blue" text="Third 🙊" />
        <View>
          <LegacyDrawerLayoutAndroid
            drawerWidth={200}
            drawerPosition="right"
            renderNavigationView={() => navigationView}>
            <Page backgroundColor="blue" text="Fourth 😎" />
          </LegacyDrawerLayoutAndroid>
        </View>
      </WrappedViewPagerAndroid>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
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

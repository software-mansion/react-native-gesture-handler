import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  legacy_createNativeWrapper,
  LegacyDrawerLayoutAndroid,
} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';

const WrappedPagerView = legacy_createNativeWrapper(PagerView, {
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
      <WrappedPagerView style={styles.container}>
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
      </WrappedPagerView>
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
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageText: {
    fontSize: 21,
    color: 'white',
  },
});

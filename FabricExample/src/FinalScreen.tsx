import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
// @ts-ignore TODO: remove once there is a .d.ts file with definitions
import openURLInBrowser from 'react-native/Libraries/Core/Devtools/openURLInBrowser';

import { COLORS } from './colors';

const SOFTWARE_MANSION_LOGO_URL =
  'https://pbs.twimg.com/profile_images/1243176655172009986/Jgdl2m15_400x400.jpg';
const SOFTWARE_MANSION_TWITTER_URL = 'https://twitter.com/swmansion/';

export default function FinalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        React Native Gesture Handler is developed by Software Mansion.
      </Text>
      <Text style={[styles.text, styles.bold]}>
        We are actively porting React Native libraries to Fabric, including
        React Native Screens and Reanimated.
      </Text>
      <Text style={styles.text}>
        Follow us on Twitter and stay tuned! @swmansion
      </Text>
      <View onTouchStart={() => openURLInBrowser(SOFTWARE_MANSION_TWITTER_URL)}>
        <Image
          source={{ uri: SOFTWARE_MANSION_LOGO_URL }}
          style={styles.logo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.NAVY,
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 21,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  logo: {
    width: 250,
    height: 250,
  },
});

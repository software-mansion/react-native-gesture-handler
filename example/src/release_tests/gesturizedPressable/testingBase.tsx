import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Pressable as GesturizedPressable } from 'react-native-gesture-handler';

const TestingBase = (props: any) => (
  <>
    <GesturizedPressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Gesturized press!</Text>
      </View>
    </GesturizedPressable>
    <Pressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Legacy press!</Text>
      </View>
    </Pressable>
  </>
);

const BG_COLOR = '#F5FCFF';

export default TestingBase;
export { BG_COLOR };

const styles = StyleSheet.create({
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F5FCFF',
  },
});

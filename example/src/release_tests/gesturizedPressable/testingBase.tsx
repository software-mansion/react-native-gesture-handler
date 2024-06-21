import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  PressableProps,
} from 'react-native';
import {
  Pressable as GesturizedPressable,
  PressableProps as GHPressableProps,
} from 'react-native-gesture-handler';

const TestingBase = (
  props: GHPressableProps & PressableProps & React.RefAttributes<View>
) => (
  <>
    <GesturizedPressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Gesturized pressable!</Text>
      </View>
    </GesturizedPressable>
    <Pressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Legacy pressable!</Text>
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

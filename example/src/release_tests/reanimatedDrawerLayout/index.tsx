import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';

import ReanimatedDrawerLayout, {
  DrawerLayoutMethods,
} from 'react-native-gesture-handler/ReanimatedDrawerLayout';
import { LoremIpsum } from '../../../src/common';

const DrawerPage = ({ progress }: { progress?: SharedValue }) => {
  progress && console.log('Drawer opening progress:', progress);
  return (
    <View style={styles.drawerContainer}>
      <LoremIpsum />
    </View>
  );
};

export default function ReanimatedDrawerExample() {
  const drawerRef = useRef<DrawerLayoutMethods>(null);
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() =>
      drawerRef.current?.openDrawer({ animationSpeed: 1, initialVelocity: 0 })
    );

  const toggleLockGesture = Gesture.Tap()
    .runOnJS(true)
    .onFinalize((_, success) =>
      console.log('inner', success ? 'activated [BAD]' : 'canceled')
    );

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      renderNavigationView={() => <DrawerPage />}>
      <View style={styles.innerContainer}>
        <GestureDetector gesture={tapGesture}>
          <View style={styles.box}>
            <Text>Open drawer</Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={toggleLockGesture}>
          <View style={styles.box}>
            <Text>Button</Text>
          </View>
        </GestureDetector>
      </View>
    </ReanimatedDrawerLayout>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  box: {
    width: 150,
    padding: 10,
    paddingHorizontal: 5,
    backgroundColor: 'pink',
  },
});

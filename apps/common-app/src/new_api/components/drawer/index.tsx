import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';

import ReanimatedDrawerLayout, {
  DrawerType,
  DrawerPosition,
  DrawerLayoutMethods,
  DrawerLockMode,
} from 'react-native-gesture-handler/ReanimatedDrawerLayout';
import { COLORS, LoremIpsum } from '../../../common';

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
  const [side, setSide] = useState(DrawerPosition.LEFT);
  const [type, setType] = useState(DrawerType.FRONT);
  const [lock, setLock] = useState(DrawerLockMode.UNLOCKED);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() =>
      drawerRef.current?.openDrawer({ animationSpeed: 1, initialVelocity: 0 })
    );

  const toggleSideGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() =>
      setSide(
        side === DrawerPosition.LEFT
          ? DrawerPosition.RIGHT
          : DrawerPosition.LEFT
      )
    );

  const toggleTypeGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() =>
      setType(
        type === DrawerType.FRONT
          ? DrawerType.BACK
          : type === DrawerType.BACK
            ? DrawerType.SLIDE
            : DrawerType.FRONT
      )
    );

  const toggleLockGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() =>
      setLock(
        lock === DrawerLockMode.UNLOCKED
          ? DrawerLockMode.LOCKED_CLOSED
          : lock === DrawerLockMode.LOCKED_CLOSED
            ? DrawerLockMode.LOCKED_OPEN
            : DrawerLockMode.UNLOCKED
      )
    );

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      renderNavigationView={() => <DrawerPage />}
      drawerPosition={side}
      drawerType={type}
      drawerLockMode={lock}
      hideStatusBar={true}>
      <View style={styles.innerContainer}>
        <GestureDetector gesture={tapGesture}>
          <View style={styles.box}>
            <Text>Open drawer</Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={toggleSideGesture}>
          <View style={styles.box}>
            <Text>
              Currently opening from:{' '}
              {side === DrawerPosition.LEFT ? 'left' : 'right'}
            </Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={toggleTypeGesture}>
          <View style={styles.box}>
            <Text>
              Current background type:{' '}
              {type === DrawerType.FRONT
                ? 'front'
                : type === DrawerType.BACK
                  ? 'back'
                  : 'slide'}
            </Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={toggleLockGesture}>
          <View style={styles.box}>
            <Text>
              Current lock mode:{' '}
              {lock === DrawerLockMode.UNLOCKED
                ? 'unlocked'
                : lock === DrawerLockMode.LOCKED_OPEN
                  ? 'locked-open'
                  : 'locked-closed'}
            </Text>
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
    backgroundColor: COLORS.KINDA_BLUE,
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
    padding: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: COLORS.PURPLE,
  },
});

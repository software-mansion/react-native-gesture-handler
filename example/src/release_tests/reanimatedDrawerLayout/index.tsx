import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';

import ReanimatedDrawerLayout, {
  DrawerType,
  DrawerPosition,
} from 'react-native-gesture-handler/ReanimatedDrawerLayout';

const DrawerPage = ({ progress }: { progress?: SharedValue }) => {
  progress && console.log('Drawer opening progress:', progress);
  return <View style={styles.drawerContainer} />;
};

export default function ReanimatedDrawerExample() {
  const drawerRef = useRef<any>(null);
  const [side, setSide] = useState<DrawerPosition>('left');
  const [type, setType] = useState<DrawerType>('front');

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => drawerRef.current?.openDrawer());

  const toggleSideGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => setSide(side === 'left' ? 'right' : 'left'));

  const toggleTypeGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => setType(type === 'front' ? 'back' : 'front'));

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      renderNavigationView={() => <DrawerPage />}
      drawerPosition={side}
      drawerType={type}>
      <View style={styles.innerContainer}>
        <GestureDetector gesture={tapGesture}>
          <View style={styles.box}>
            <Text>Open drawer</Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={toggleSideGesture}>
          <View style={styles.box}>
            <Text>Currently opening from: {side}</Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={toggleTypeGesture}>
          <View style={styles.box}>
            <Text>Current background type: {type}</Text>
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

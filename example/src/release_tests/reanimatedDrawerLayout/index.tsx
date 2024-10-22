import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';

// @ts-ignore no idea why it's complaining, but the import is valid
import ReanimatedDrawerLayout from 'react-native-gesture-handler/ReanimatedDrawerLayout';

const DrawerPage = ({ progress }: { progress?: SharedValue }) => {
  progress && console.log('Drawer opening progress:', progress);
  return <View style={styles.drawerContainer} />;
};

export default function ReanimatedDrawerExample() {
  const drawerRef = useRef<any>(null);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => drawerRef.current?.openDrawer());

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      renderNavigationView={() => <DrawerPage />}
      drawerPosition="left"
      drawerType="front">
      <View style={styles.innerContainer}>
        <GestureDetector gesture={tapGesture}>
          <View style={styles.box}>
            <Text>Open drawer</Text>
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
  },
  box: {
    margin: 'auto',
    padding: 35,
    paddingHorizontal: 25,
    backgroundColor: 'pink',
  },
});

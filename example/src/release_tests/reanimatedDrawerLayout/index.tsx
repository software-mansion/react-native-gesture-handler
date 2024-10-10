import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReanimatedDrawerLayout from 'react-native-gesture-handler/ReanimatedDrawerLayout';
import { SharedValue } from 'react-native-reanimated';

const DrawerPage = ({ progress }: { progress?: SharedValue }) => {
  progress && console.log('Drawer opening progress:', progress);
  return <View style={styles.drawerContainer} />;
};

export default function ReanimatedDrawerExample() {
  const drawerRef = useRef<ReanimatedDrawerLayout>(null);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => drawerRef.current?.openDrawer());

  return (
    <ReanimatedDrawerLayout
      ref={drawerRef}
      renderNavigationView={() => <DrawerPage />}>
      <GestureDetector gesture={tapGesture}>
        <View style={styles.innerContainer}>
          <Text>Open drawer</Text>
        </View>
      </GestureDetector>
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
    margin: 'auto',
    padding: 35,
    paddingHorizontal: 25,
    backgroundColor: 'pink',
  },
});

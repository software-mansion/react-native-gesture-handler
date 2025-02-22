/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Button, SafeAreaView, View } from 'react-native';
import {
  GestureHandlerRootView,
  NativeDetector,
  RawButton,
  useGesture,
} from 'react-native-gesture-handler';

import Navigator from './Navigator';

import ComponentsScreen from './ComponentsScreen';
import FinalScreen from './FinalScreen';
import GestureCompositionScreen from './GestureCompositionScreen';
import HomeScreen from './HomeScreen';
import ViewFlatteningScreen from './ViewFlatteningScreen';

const Stack = Navigator.create();

Stack.setRoutes({
  home: {
    component: HomeScreen,
    title: 'RNGH FabricExample',
    rightButtonAction: () => {
      Stack.navigateTo('gestureComposition');
    },
  },
  gestureComposition: {
    component: GestureCompositionScreen,
    title: 'Gesture Composition',
    rightButtonAction: () => {
      Stack.navigateTo('components');
    },
  },
  components: {
    component: ComponentsScreen,
    title: 'Components',
    rightButtonAction: () => {
      Stack.navigateTo('viewFlattening');
    },
  },
  viewFlattening: {
    component: ViewFlatteningScreen,
    title: 'View Flattening',
    rightButtonAction: () => {
      Stack.navigateTo('final');
    },
  },
  final: {
    component: FinalScreen,
    title: 'Final Screen',
  },
});

export default function App() {
  const [visible, setVisible] = React.useState(true);
  const tap = useGesture('TapGestureHandler', {
    numberOfTaps: 2,
  });

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: 'white', paddingTop: 150 }}>
      <Button
        title="Toggle"
        onPress={() => {
          setVisible(!visible);
        }}
      />

      {visible && (
        <NativeDetector gesture={tap}>
          <View
            style={{
              width: 150,
              height: 150,
              backgroundColor: 'blue',
              opacity: 0.5,
              borderWidth: 10,
              borderColor: 'green',
              marginTop: 20,
              marginLeft: 40,
            }}
          />
        </NativeDetector>
      )}
    </GestureHandlerRootView>
  );
}

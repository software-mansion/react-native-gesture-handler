import * as React from 'react';
import { SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[{ flex: 1 }, Platform.OS === 'android' && { paddingTop: 50 }]}>
        <Stack.Navigator initialRouteName="home" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

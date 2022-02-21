import * as React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import OverviewExample from './examples/OverviewExample';
import UltimateExample from './examples/ultimate/UltimateExample';
import ViewFlatteningExample from './examples/ViewFlatteningExample';
import ComponentsExample from './examples/ComponentsExample';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="OverviewExample" component={OverviewExample} />
          <Stack.Screen name="UltimateExample" component={UltimateExample} />
          <Stack.Screen
            name="ViewFlatteningExample"
            component={ViewFlatteningExample}
          />
          <Stack.Screen
            name="ComponentsExample"
            component={ComponentsExample}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

import {LogBox} from 'react-native';
import * as React from 'react';
import UltimateExample from './UltimateExample';
import ViewFlatteningExample from './ViewFlatteningExample';
import HomeScreen from './HomeScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="UltimateExample" component={UltimateExample} />
        <Stack.Screen
          name="ViewFlatteningExample"
          component={ViewFlatteningExample}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

LogBox.ignoreLogs([
  "Seems like you're using an old API with gesture components", // react-native-gesture-handler
  'GestureDetector has received a child that may get view-flattened.', // react-native-gesture-handler
  'Function components cannot be given refs.', // react-native-screens
]);

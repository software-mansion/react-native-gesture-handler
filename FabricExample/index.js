/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';

import App from './AppTest';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

LogBox.ignoreLogs([
  "Seems like you're using an old API with gesture components", // react-native-gesture-handler
  'GestureDetector has received a child that may get view-flattened.', // react-native-gesture-handler
]);

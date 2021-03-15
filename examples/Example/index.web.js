import { AppRegistry, Platform } from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('Example', () => App);
AppRegistry.runApplication('Example', {
  rootTag: document.getElementById('root'),
});

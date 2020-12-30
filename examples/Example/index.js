import { AppRegistry } from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('Example', () => App);
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});

import { AppRegistry } from 'react-native';

import ExampleApp from './App';

AppRegistry.registerComponent('App', () => ExampleApp);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });

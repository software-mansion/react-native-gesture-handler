import {LogBox} from 'react-native';
import UltimateExample from './UltimateExample';
import ViewFlatteningExample from './ViewFlatteningExample';

LogBox.ignoreLogs([
  "Seems like you're using an old API with gesture components",
]);

export default ViewFlatteningExample;

import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly installBridgeless: () => boolean;
}

export default TurboModuleRegistry.get<Spec>('RNGHTurboCppModule');

import RNGestureHandlerModule from './RNGestureHandlerModule';

let moduleId: number | undefined;

// Identifies the native module instance that owns the gesture registry.
// Asking the module for it guarantees the module is instantiated first.
export function getModuleId(): number {
  moduleId ??= RNGestureHandlerModule.getModuleId();

  return moduleId;
}

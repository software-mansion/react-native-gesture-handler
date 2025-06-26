import { Platform } from 'react-native';
import { PressableEvent } from './PressableProps';
import { StateMachine } from './StateMachine';

export enum StateMachineEvent {
  NATIVE_BEGIN = 'nativeBegin',
  NATIVE_START = 'nativeStart',
  NATIVE_END = 'nativeEnd',
  LONG_PRESS_TOUCHES_DOWN = 'longPressTouchesDown',
}

export function getConfiguredStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  if (Platform.OS === 'android') {
    return new StateMachine([
      {
        signal: StateMachineEvent.NATIVE_BEGIN,
      },
      {
        signal: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
        callback: handlePressIn,
      },
      {
        signal: StateMachineEvent.NATIVE_START,
      },
      {
        signal: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else if (Platform.OS === 'ios') {
    return new StateMachine([
      {
        signal: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
      },
      {
        signal: StateMachineEvent.NATIVE_START,
        callback: handlePressIn,
      },
      {
        signal: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else if (Platform.OS === 'web') {
    return new StateMachine([
      {
        signal: StateMachineEvent.NATIVE_BEGIN,
      },
      {
        signal: StateMachineEvent.NATIVE_START,
      },
      {
        signal: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
        callback: handlePressIn,
      },
      {
        signal: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else if (Platform.OS === 'macos') {
    return new StateMachine([
      {
        signal: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
      },
      {
        signal: StateMachineEvent.NATIVE_BEGIN,
        callback: handlePressIn,
      },
      {
        signal: StateMachineEvent.NATIVE_START,
      },
      {
        signal: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else {
    // Unknown platform - using minimal universal setup.
    return new StateMachine([
      {
        signal: StateMachineEvent.NATIVE_END,
        callback: (event: PressableEvent) => {
          handlePressIn(event);
          handlePressOut(event);
        },
      },
    ]);
  }
}

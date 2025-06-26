import { Platform } from 'react-native';
import { PressableEvent } from './PressableProps';
import { PressableStateMachine } from './StateMachine';

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
    return new PressableStateMachine([
      {
        eventName: StateMachineEvent.NATIVE_BEGIN,
      },
      {
        eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
        callback: handlePressIn,
      },
      {
        eventName: StateMachineEvent.NATIVE_START,
      },
      {
        eventName: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else if (Platform.OS === 'ios') {
    return new PressableStateMachine([
      {
        eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
      },
      {
        eventName: StateMachineEvent.NATIVE_START,
        callback: handlePressIn,
      },
      {
        eventName: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else if (Platform.OS === 'web') {
    return new PressableStateMachine([
      {
        eventName: StateMachineEvent.NATIVE_BEGIN,
      },
      {
        eventName: StateMachineEvent.NATIVE_START,
      },
      {
        eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
        callback: handlePressIn,
      },
      {
        eventName: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else if (Platform.OS === 'macos') {
    return new PressableStateMachine([
      {
        eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
      },
      {
        eventName: StateMachineEvent.NATIVE_BEGIN,
        callback: handlePressIn,
      },
      {
        eventName: StateMachineEvent.NATIVE_START,
      },
      {
        eventName: StateMachineEvent.NATIVE_END,
        callback: handlePressOut,
      },
    ]);
  } else {
    // Unknown platform - using minimal universal setup.
    return new PressableStateMachine([
      {
        eventName: StateMachineEvent.NATIVE_END,
        callback: (event: PressableEvent) => {
          handlePressIn(event);
          handlePressOut(event);
        },
      },
    ]);
  }
}

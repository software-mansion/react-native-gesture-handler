import { Platform } from 'react-native';
import { PressableEvent } from './PressableProps';
import { PressableStateMachine } from './StateMachine';

export enum StateMachineEvent {
  NATIVE_BEGIN = 'nativeBegin',
  NATIVE_START = 'nativeStart',
  NATIVE_FINALIZE = 'nativeFinalize',
  LONG_PRESS_TOUCHES_DOWN = 'longPressTouchesDown',
}

function getAndroidStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return new PressableStateMachine([
    {
      eventName: StateMachineEvent.NATIVE_BEGIN,
    },
    {
      eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
      callback: handlePressIn,
    },
    {
      eventName: StateMachineEvent.NATIVE_FINALIZE,
      callback: handlePressOut,
    },
  ]);
}

function getIosStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return new PressableStateMachine([
    {
      eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
    },
    {
      eventName: StateMachineEvent.NATIVE_START,
      callback: handlePressIn,
    },
    {
      eventName: StateMachineEvent.NATIVE_FINALIZE,
      callback: handlePressOut,
    },
  ]);
}

function getWebStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
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
      eventName: StateMachineEvent.NATIVE_FINALIZE,
      callback: handlePressOut,
    },
  ]);
}

function getMacosStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
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
      eventName: StateMachineEvent.NATIVE_FINALIZE,
      callback: handlePressOut,
    },
  ]);
}

function getUniversalStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return new PressableStateMachine([
    {
      eventName: StateMachineEvent.NATIVE_FINALIZE,
      callback: (event: PressableEvent) => {
        handlePressIn(event);
        handlePressOut(event);
      },
    },
  ]);
}

export function getConfiguredStateMachine(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  if (Platform.OS === 'android') {
    return getAndroidStateMachine(handlePressIn, handlePressOut);
  } else if (Platform.OS === 'ios') {
    return getIosStateMachine(handlePressIn, handlePressOut);
  } else if (Platform.OS === 'web') {
    return getWebStateMachine(handlePressIn, handlePressOut);
  } else if (Platform.OS === 'macos') {
    return getMacosStateMachine(handlePressIn, handlePressOut);
  } else {
    // Unknown platform - using minimal universal setup.
    return getUniversalStateMachine(handlePressIn, handlePressOut);
  }
}

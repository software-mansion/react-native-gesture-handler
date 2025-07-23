import { Platform } from 'react-native';
import { PressableEvent } from './PressableProps';
import { StateDefinition } from './StateMachine';

export enum StateMachineEvent {
  NATIVE_BEGIN = 'nativeBegin',
  NATIVE_START = 'nativeStart',
  FINALIZE = 'finalize',
  LONG_PRESS_TOUCHES_DOWN = 'longPressTouchesDown',
}

function getAndroidStatesConfig(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return [
    {
      eventName: StateMachineEvent.NATIVE_BEGIN,
    },
    {
      eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
      callback: handlePressIn,
    },
    {
      eventName: StateMachineEvent.FINALIZE,
      callback: handlePressOut,
    },
  ];
}

function getIosStatesConfig(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return [
    {
      eventName: StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
    },
    {
      eventName: StateMachineEvent.NATIVE_START,
      callback: handlePressIn,
    },
    {
      eventName: StateMachineEvent.FINALIZE,
      callback: handlePressOut,
    },
  ];
}

function getWebStatesConfig(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return [
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
      eventName: StateMachineEvent.FINALIZE,
      callback: handlePressOut,
    },
  ];
}

function getMacosStatesConfig(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return [
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
      eventName: StateMachineEvent.FINALIZE,
      callback: handlePressOut,
    },
  ];
}

function getUniversalStatesConfig(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
) {
  return [
    {
      eventName: StateMachineEvent.FINALIZE,
      callback: (event: PressableEvent) => {
        handlePressIn(event);
        handlePressOut(event);
      },
    },
  ];
}

export function getStatesConfig(
  handlePressIn: (event: PressableEvent) => void,
  handlePressOut: (event: PressableEvent) => void
): StateDefinition[] {
  if (Platform.OS === 'android') {
    return getAndroidStatesConfig(handlePressIn, handlePressOut);
  } else if (Platform.OS === 'ios') {
    return getIosStatesConfig(handlePressIn, handlePressOut);
  } else if (Platform.OS === 'web') {
    return getWebStatesConfig(handlePressIn, handlePressOut);
  } else if (Platform.OS === 'macos') {
    return getMacosStatesConfig(handlePressIn, handlePressOut);
  } else {
    // Unknown platform - using minimal universal setup.
    return getUniversalStatesConfig(handlePressIn, handlePressOut);
  }
}

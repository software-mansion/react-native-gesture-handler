import { fireEvent } from '@testing-library/react-native';

export const fireGestureHandlerClick = (component) => {
  jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'web',
    select: () => null,
  }));

  // simulate undetermined -> begin state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      handlerTag: 1,
      oldState: 0,
      state: 2,
    },
  });

  // simulate begin -> active state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      handlerTag: 1,
      oldState: 2,
      state: 4,
    },
  });

  // simulate active -> end state change
  fireEvent(component, 'gestureHandlerStateChange', {
    nativeEvent: {
      handlerTag: 1,
      oldState: 4,
      state: 5,
    },
  });
  // jest.unmock('react-native/Libraries/Utilities/Platform');
};

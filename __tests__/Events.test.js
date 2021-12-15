import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import {
  GestureHandlerRootView,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { fireGestureHandlerClick } from '../src/jestUtils'
import { useAnimatedGestureHandler } from 'react-native-reanimated';

const App = (props) => {
  const eventHandler = useAnimatedGestureHandler({
    onStart: () => {
      props.begin();
    },
    onEnd: () => {
      props.press();
    },
  });

  return (
    <GestureHandlerRootView>
      {/* handlerTag: 1 */}
      <TapGestureHandler onHandlerStateChange={eventHandler}>
        <View>
          <Text>Text</Text>
        </View>
      </TapGestureHandler>

      {/* handlerTag: 2 */}
      <TapGestureHandler onHandlerStateChange={eventHandler}>
        <View>
          <Text>Text2</Text>
        </View>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
};

test('test', () => {  
  const begin = jest.fn();
  const press = jest.fn();

  const { getByText } = render(<App begin={begin} press={press} />);

  fireGestureHandlerClick(getByText('Text'), 1);
  fireGestureHandlerClick(getByText('Text2'), 2);
  
  expect(begin).toHaveBeenCalledTimes(2);
  expect(press).toHaveBeenCalledTimes(2);
});
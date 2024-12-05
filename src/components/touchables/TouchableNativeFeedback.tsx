import React, { useEffect } from 'react';
import { TouchableNativeFeedback as RNTouchableNativeFeedback } from 'react-native';
import { tagMessage } from '../../utils';

/**
 * @deprecated TouchableNativeFeedback will be removed in Gesture Handler 4
 */
const TouchableNativeFeedback: React.FC<
  React.ComponentProps<typeof RNTouchableNativeFeedback>
> = (props) => {
  useEffect(() => {
    console.warn(
      tagMessage(
        'TouchableOpacity component will be removed in Gesture Handler 4'
      )
    );
  }, []);

  return <RNTouchableNativeFeedback {...props} />;
};

export default TouchableNativeFeedback;

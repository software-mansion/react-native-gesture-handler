import React, { useRef } from 'react';
import {
  Pressable as RNPressable,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

export default function Example() {
  const feedbackRefRNGH = useRef<FeedbackHandle>(null);
  const feedbackRefRN = useRef<FeedbackHandle>(null);

  const showRNGH = (message: string) => {
    feedbackRefRNGH.current?.showMessage(message);
  };
  const showRN = (message: string) => {
    feedbackRefRN.current?.showMessage(message);
  };
  return (
    <View style={commonStyles.centerView}>
      <View style={commonStyles.subcontainer}>
        <Text style={commonStyles.header}>Gesturized Nested Pressables</Text>
        <GesturizedBoxes show={showRNGH} />
        <Feedback ref={feedbackRefRNGH} />
      </View>
      <View style={commonStyles.subcontainer}>
        <Text style={commonStyles.header}>React Native Nested Pressables</Text>
        <LegacyBoxes show={showRN} />
        <Feedback ref={feedbackRefRN} />
      </View>
    </View>
  );
}

const BOX_SIZE_COEFFICIENT = 80;

const getBoxStyle = (size: number) => ({
  width: size,
  height: size,
});

const innerStyle = ({ pressed }: PressableStateCallbackType) => [
  getBoxStyle(BOX_SIZE_COEFFICIENT),
  pressed
    ? { backgroundColor: COLORS.KINDA_RED }
    : { backgroundColor: COLORS.RED },
  styles.centering,
];
const middleStyle = ({ pressed }: PressableStateCallbackType) => [
  getBoxStyle(BOX_SIZE_COEFFICIENT * 2),
  pressed
    ? { backgroundColor: COLORS.KINDA_GREEN }
    : { backgroundColor: COLORS.GREEN },
  styles.centering,
];
const outerStyle = ({ pressed }: PressableStateCallbackType) => [
  getBoxStyle(BOX_SIZE_COEFFICIENT * 3),
  pressed
    ? { backgroundColor: COLORS.KINDA_BLUE }
    : { backgroundColor: COLORS.NAVY },
  styles.centering,
];

function GesturizedBoxes({ show }: { show: (m: string) => void }) {
  return (
    <Pressable
      style={outerStyle}
      testID="outer"
      onPressIn={() => show('[outer] onPressIn')}
      onPressOut={() => show('[outer] onPressOut')}
      onPress={() => show('[outer] onPress')}
      onLongPress={() => show('[outer] onLongPress')}>
      <Pressable
        style={middleStyle}
        testID="middle"
        onPressIn={() => show('[middle] onPressIn')}
        onPressOut={() => show('[middle] onPressOut')}
        onPress={() => show('[middle] onPress')}
        onLongPress={() => show('[middle] onLongPress')}>
        <Pressable
          style={innerStyle}
          testID="inner"
          onPressIn={() => show('[inner] onPressIn')}
          onPressOut={() => show('[inner] onPressOut')}
          onPress={() => show('[inner] onPress')}
          onLongPress={() => show('[inner] onLongPress')}
        />
      </Pressable>
    </Pressable>
  );
}

function LegacyBoxes({ show }: { show: (m: string) => void }) {
  return (
    <RNPressable
      style={outerStyle}
      onPressIn={() => show('[outer] onPressIn')}
      onPressOut={() => show('[outer] onPressOut')}
      onPress={() => show('[outer] onPress')}
      onLongPress={() => show('[outer] onLongPress')}>
      <RNPressable
        style={middleStyle}
        onPressIn={() => show('[middle] onPressIn')}
        onPressOut={() => show('[middle] onPressOut')}
        onPress={() => show('[middle] onPress')}
        onLongPress={() => show('[middle] onLongPress')}>
        <RNPressable
          style={innerStyle}
          onPressIn={() => show('[inner] onPressIn')}
          onPressOut={() => show('[inner] onPressOut')}
          onPress={() => show('[inner] onPress')}
          onLongPress={() => show('[inner] onLongPress')}
        />
      </RNPressable>
    </RNPressable>
  );
}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

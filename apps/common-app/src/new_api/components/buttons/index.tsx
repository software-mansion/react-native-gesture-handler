import { RefObject, useRef } from 'react';
import { COLORS, Feedback, FeedbackHandle } from '../../../common';
import { StyleSheet, Text, View } from 'react-native';
import {
  BaseButton,
  BorderlessButton,
  GestureHandlerRootView,
  Pressable,
  RectButton,
} from 'react-native-gesture-handler';

type ButtonWrapperProps = {
  ButtonComponent:
    | typeof BaseButton
    | typeof RectButton
    | typeof BorderlessButton
    | typeof Pressable;

  color: string;
  feedback?: RefObject<FeedbackHandle | null>;
};

function ButtonWrapper({
  ButtonComponent,
  color,
  feedback,
}: ButtonWrapperProps) {
  return (
    <ButtonComponent
      style={[styles.button, { backgroundColor: color }]}
      onPress={() =>
        feedback?.current?.showMessage(`[${ButtonComponent.name}] onLongPress`)
      }
      onLongPress={() => {
        feedback?.current?.showMessage(`[${ButtonComponent.name}] onLongPress`);
      }}>
      <Text style={styles.buttonText}>{ButtonComponent.name}</Text>
    </ButtonComponent>
  );
}

export default function ButtonsExample() {
  const feedbackRef1 = useRef<FeedbackHandle>(null);
  const feedbackRef2 = useRef<FeedbackHandle>(null);
  const feedbackRef3 = useRef<FeedbackHandle>(null);
  const feedbackRef4 = useRef<FeedbackHandle>(null);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.inner_container}>
        <ButtonWrapper
          ButtonComponent={BaseButton}
          color={COLORS.NAVY}
          feedback={feedbackRef1}
        />
        <Feedback ref={feedbackRef1} />
      </View>
      <View style={styles.inner_container}>
        <ButtonWrapper
          ButtonComponent={RectButton}
          color={COLORS.PURPLE}
          feedback={feedbackRef2}
        />
        <Feedback ref={feedbackRef2} />
      </View>
      <View style={styles.inner_container}>
        <ButtonWrapper
          ButtonComponent={BorderlessButton}
          color={COLORS.RED}
          feedback={feedbackRef3}
        />
        <Feedback ref={feedbackRef3} />
      </View>
      <View style={styles.inner_container}>
        <ButtonWrapper
          ButtonComponent={Pressable}
          color={COLORS.GREEN}
          feedback={feedbackRef4}
        />
        <Feedback ref={feedbackRef4} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inner_container: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  button: {
    width: 200,
    height: 50,
    borderRadius: 15,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

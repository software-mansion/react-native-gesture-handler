import * as React from 'react';
import { useState, useRef } from 'react';
import { StyleSheet, Modal, View, Text } from 'react-native';
import {
  GestureHandlerRootView,
  RectButton,
  GestureDetector,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Feedback,
  FeedbackHandle,
  COLORS,
  commonStyles,
} from '../../../common';

interface DraggableBoxProps {
  minDist?: number;
}

function DraggableBox({ minDist }: DraggableBoxProps) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const panGesture = usePanGesture({
    minDistance: minDist,
    onActivate: () => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    },
    onUpdate: (event) => {
      translationX.value = prevTranslationX.value + event.translationX;
      translationY.value = prevTranslationY.value + event.translationY;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[commonStyles.box, styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

export default function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const feedbackRef = useRef<FeedbackHandle>(null);

  function ToggleModalButton() {
    return (
      <RectButton
        style={[styles.button, { backgroundColor: COLORS.KINDA_BLUE }]}
        onPress={() => {
          const newState = !isModalVisible;
          setIsModalVisible(newState);
          feedbackRef.current?.showMessage(
            newState ? 'Modal Opened' : 'Modal Closed'
          );
        }}>
        <Text style={{ color: COLORS.NAVY, fontWeight: '600' }}>
          {isModalVisible ? 'Close' : 'Open'} modal
        </Text>
      </RectButton>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={[commonStyles.header, styles.description]}>
        DraggableBox inside modal should be moveable
      </Text>
      <ToggleModalButton />
      <Feedback ref={feedbackRef} />
      <Modal visible={isModalVisible} transparent={false} animationType="slide">
        <GestureHandlerRootView
          style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
          <View style={[styles.modalView, { borderColor: COLORS.PURPLE }]}>
            <DraggableBox />
            <ToggleModalButton />
            <Feedback ref={feedbackRef} />
          </View>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    marginTop: 200,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  description: {
    margin: 20,
    color: COLORS.NAVY,
  },
  button: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  box: {
    backgroundColor: COLORS.PURPLE,
    width: 100,
    height: 100,
    borderRadius: 20,
    zIndex: 1,
  },
});

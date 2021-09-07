import React, { useState } from 'react';
import { StyleSheet, ImageStyle, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 44; // let's assume it's always the same for ease of understanding ;)
const CHAT_HEADS = [
  { imageUrl: 'https://avatars0.githubusercontent.com/u/379606?v=4&s=460' },
  { imageUrl: 'https://avatars.githubusercontent.com/u/15989228?v=4&s=460' },
  { imageUrl: 'https://avatars3.githubusercontent.com/u/90494?v=4&s=460' },
  { imageUrl: 'https://avatars3.githubusercontent.com/u/726445?v=4&s=460' },
];

interface AnimatedOffset {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
}

interface FollowingChatHeadProps {
  imageUri: string;
  offset: AnimatedOffset;
  offsetToFollow: AnimatedOffset;
  style?: ImageStyle;
}

function FollowingChatHead({
  imageUri,
  style,
  offset,
  offsetToFollow,
}: FollowingChatHeadProps) {
  useDerivedValue(() => {
    offset.x.value = withSpring(offsetToFollow.x.value);
    offset.y.value = withSpring(offsetToFollow.y.value);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.x.value },
        { translateY: offset.y.value },
      ],
    };
  });

  return (
    <Animated.Image
      style={[styles.box, style, animatedStyle]}
      source={{
        uri: imageUri,
      }}
    />
  );
}

function useOffsetAnimatedValue() {
  return {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };
}

const Example = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const dragOffset = useOffsetAnimatedValue();
  const mainChatHeadPosition = useOffsetAnimatedValue();
  const chatHeadsOffsets = CHAT_HEADS.map(useOffsetAnimatedValue);

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setDimensions({ width, height });
  };

  const panHandler = Gesture.Pan()
    .onUpdate(({ translationX, translationY }) => {
      'worklet';
      dragOffset.x.value = mainChatHeadPosition.x.value + translationX;
      dragOffset.y.value = mainChatHeadPosition.y.value + translationY;
    })
    .onEnd(({ absoluteX, absoluteY }) => {
      const { height, width } = dimensions;

      const distFromTop = absoluteY - HEADER_HEIGHT;
      const distFromBottom = height - absoluteY;
      const distFromLeft = absoluteX;
      const distFromRight = width - absoluteX;

      const minDist = Math.min(
        distFromTop,
        distFromBottom,
        distFromLeft,
        distFromRight
      );

      // drag to the edge
      switch (minDist) {
        case distFromTop: {
          dragOffset.y.value = withSpring(-IMAGE_SIZE / 2);
          mainChatHeadPosition.y.value = -IMAGE_SIZE / 2;
          mainChatHeadPosition.x.value = dragOffset.x.value;
          break;
        }
        case distFromBottom: {
          dragOffset.y.value = withSpring(height - IMAGE_SIZE / 2);
          mainChatHeadPosition.y.value = height - IMAGE_SIZE / 2;
          mainChatHeadPosition.x.value = dragOffset.x.value;
          break;
        }
        case distFromLeft: {
          dragOffset.x.value = withSpring(-IMAGE_SIZE / 2);
          mainChatHeadPosition.x.value = -IMAGE_SIZE / 2;
          mainChatHeadPosition.y.value = dragOffset.y.value;
          break;
        }
        case distFromRight: {
          dragOffset.x.value = withSpring(width - IMAGE_SIZE / 2);
          mainChatHeadPosition.x.value = width - IMAGE_SIZE / 2;
          mainChatHeadPosition.y.value = dragOffset.y.value;
          break;
        }
      }
    });

  const headsComponents = CHAT_HEADS.map(({ imageUrl }, idx) => {
    const headOffset = chatHeadsOffsets[idx];
    if (idx === 0) {
      return (
        <GestureDetector gesture={panHandler} key={imageUrl}>
          <FollowingChatHead
            offsetToFollow={dragOffset}
            imageUri={imageUrl}
            offset={headOffset}
          />
        </GestureDetector>
      );
    }

    return (
      <FollowingChatHead
        key={imageUrl}
        imageUri={imageUrl}
        style={{
          marginLeft: idx * 5,
          marginTop: idx * 5,
        }}
        offset={headOffset}
        offsetToFollow={chatHeadsOffsets[idx - 1]}
      />
    );
  });

  return (
    <SafeAreaView style={styles.container} onLayout={onLayout}>
      {/* we want ChatHead with gesture on top  */}
      {headsComponents.reverse()}
    </SafeAreaView>
  );
};

export default Example;

const IMAGE_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  box: {
    position: 'absolute',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderColor: '#F5FCFF',
    backgroundColor: 'plum',
    borderRadius: IMAGE_SIZE / 2,
  },
});

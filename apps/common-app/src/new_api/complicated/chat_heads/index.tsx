import React, { useState } from 'react';
import { StyleSheet, ImageStyle, LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

const CHAT_HEADS = [
  { imageUrl: 'https://avatars0.githubusercontent.com/u/379606?v=4&s=460' },
  { imageUrl: 'https://avatars3.githubusercontent.com/u/90494?v=4&s=460' },
  { imageUrl: 'https://avatars3.githubusercontent.com/u/726445?v=4&s=460' },
  { imageUrl: 'https://avatars.githubusercontent.com/u/15989228?v=4&s=460' },
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

function clampToValues({
  value,
  bottom,
  top,
}: {
  value: number;
  bottom: number;
  top: number;
}) {
  'worklet';
  return Math.max(bottom, Math.min(value, top));
}

const Example = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const panOffset = useOffsetAnimatedValue();
  const mainChatHeadPosition = useOffsetAnimatedValue();
  const chatHeadsOffsets = CHAT_HEADS.map(useOffsetAnimatedValue);
  const headerHeight = useHeaderHeight();

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setDimensions({ width, height });
  };

  const panHandler = usePanGesture({
    onUpdate: (e) => {
      panOffset.x.value = mainChatHeadPosition.x.value + e.translationX;
      panOffset.y.value = mainChatHeadPosition.y.value + e.translationY;
    },
    onDeactivate: (e) => {
      const { height, width } = dimensions;

      const velocityDragX = clampToValues({
        value: e.velocityX * 0.05,
        bottom: -100,
        top: 100,
      });
      const velocityDragY = clampToValues({
        value: e.velocityY * 0.05,
        bottom: -100,
        top: 100,
      });

      const distFromTop = e.absoluteY + velocityDragY - headerHeight;
      const distFromBottom = height + velocityDragY - e.absoluteY;
      const distFromLeft = e.absoluteX + velocityDragX;
      const distFromRight = width - e.absoluteX + velocityDragX;

      const minDist = Math.min(
        distFromTop,
        distFromBottom,
        distFromLeft,
        distFromRight
      );

      // drag to the edge
      switch (minDist) {
        case distFromTop: {
          panOffset.y.value = withSpring(-IMAGE_SIZE / 2);
          panOffset.x.value = withSpring(panOffset.x.value + velocityDragX);
          mainChatHeadPosition.y.value = -IMAGE_SIZE / 2;
          mainChatHeadPosition.x.value = panOffset.x.value;
          break;
        }
        case distFromBottom: {
          panOffset.y.value = withSpring(height - IMAGE_SIZE / 2);
          panOffset.x.value = withSpring(panOffset.x.value + velocityDragX);
          mainChatHeadPosition.y.value = height - IMAGE_SIZE / 2;
          mainChatHeadPosition.x.value = panOffset.x.value;
          break;
        }
        case distFromLeft: {
          panOffset.x.value = withSpring(-IMAGE_SIZE / 2);
          panOffset.y.value = withSpring(panOffset.y.value + velocityDragY);
          mainChatHeadPosition.x.value = -IMAGE_SIZE / 2;
          mainChatHeadPosition.y.value = panOffset.y.value;
          break;
        }
        case distFromRight: {
          panOffset.x.value = withSpring(width - IMAGE_SIZE / 2);
          panOffset.y.value = withSpring(panOffset.y.value + velocityDragY);
          mainChatHeadPosition.x.value = width - IMAGE_SIZE / 2;
          mainChatHeadPosition.y.value = panOffset.y.value;
          break;
        }
      }
    },
  });

  const headsComponents = CHAT_HEADS.map(({ imageUrl }, idx) => {
    const headOffset = chatHeadsOffsets[idx];
    if (idx === 0) {
      return (
        <GestureDetector gesture={panHandler} key={imageUrl}>
          <FollowingChatHead
            offsetToFollow={panOffset}
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

import React, { Text, StyleSheet, View, Alert } from 'react-native';

import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FlashList, ListRenderItem, useBenchmark } from '@shopify/flash-list';
import { memo, useRef } from 'react';
import {
  GestureHandlerRootView,
  // Swipeable as LegacySwipeable,
} from 'react-native-gesture-handler';

function RightAction() {
  return <Text style={styles.rightAction}>Text</Text>;
}

type Item = {
  id: string;
  testID: string;
  title: string;
};

const generateItems = (count: number): Item[] => {
  return Array(count)
    .fill(0)
    .map((value, idx) => {
      // render speed test
      return {
        id: String(idx),
        testID: String(idx),
        title: `Number ${idx}`,
      };

      // re-renders test
      // return {
      //   id: String(idx),
      //   testID: String(value),
      //   title: `Number ${value}`,
      // };
    });
};

const data = generateItems(200);

const _RenderItemView = (item: Item) => (
  <View style={styles.swipeable}>
    <Text>{item.title}</Text>
  </View>
);

const RenderItemViewMemoed = memo(_RenderItemView);

export default function Example() {
  const renderItem: ListRenderItem<Item> = ({ item }) => {
    return (
      <ReanimatedSwipeable
        renderRightActions={RightAction}
        testID={item.testID}>
        <RenderItemViewMemoed {...item} />
      </ReanimatedSwipeable>
    );
  };

  const flashListRef = useRef<FlashList<Item> | null>(null);
  useBenchmark(flashListRef, (callback) => {
    Alert.alert('result', callback.formattedString);
  });

  return (
    <GestureHandlerRootView>
      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderItem}
        estimatedItemSize={50}
        keyExtractor={(item) => item.id}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  leftAction: { width: 50, height: 50, backgroundColor: 'crimson' },
  rightAction: { width: 50, height: 50, backgroundColor: 'purple' },
  separator: {
    width: '100%',
    borderTopWidth: 1,
  },
  swipeable: {
    height: 50,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
  },
});

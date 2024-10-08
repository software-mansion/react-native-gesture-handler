import React, { useCallback } from 'react';
import { Text, StyleSheet, View, Alert } from 'react-native';

import { FlashList, ListRenderItem, useBenchmark } from '@shopify/flash-list';
import { useRef } from 'react';
import { Pressable } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

type Item = {
  id: string;
  title: string;
};

const generateItems = (count: number): Item[] => {
  return Array.from({ length: count }, () => {
    const randomNumber = Math.random().toString(36).substring(2, 8);
    return {
      id: randomNumber,
      title: `Title ${randomNumber}`,
    };
  });
};

const data = generateItems(200);

export default function Example() {
  const renderSwipeable: ListRenderItem<Item> = useCallback(
    ({ item }: { item: any }) => {
      return (
        <ReanimatedSwipeable>
          <View style={styles.swipeable}>
            <Text>{item.title}</Text>
          </View>
        </ReanimatedSwipeable>
      );
      // eslint-disable-next-line no-unreachable
      return (
        <Pressable>
          <View style={styles.swipeable}>
            <Text>{item.title}</Text>
          </View>
        </Pressable>
      );
    },
    []
  );

  const flashListRef = useRef<FlashList<Item> | null>(null);
  useBenchmark(flashListRef, (callback) => {
    Alert.alert('result', callback.formattedString);
  });

  console.log('main rerender');

  return (
    <FlashList
      ref={flashListRef}
      data={data}
      renderItem={renderSwipeable}
      estimatedItemSize={50}
      keyExtractor={(item: any) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  action: { width: 50, height: 50, backgroundColor: 'purple' },
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

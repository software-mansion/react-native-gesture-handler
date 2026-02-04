import { COLORS } from '../../../common';
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  FlatList,
  RefreshControl,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const DATA = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  title: `Item ${i + 1}`,
}));

const Item = ({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default function FlatListExample() {
  const [refreshing, setRefreshing] = useState(false);

  const ref = useRef<FlatList>(null);

  const onRefresh = () => {
    setRefreshing(true);
    console.log(ref.current);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <GestureHandlerRootView>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={ref}
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Item title={item.title} />}
        contentContainerStyle={styles.container}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  item: {
    backgroundColor: COLORS.KINDA_BLUE,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
  },
});

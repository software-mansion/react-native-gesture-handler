import { COLORS } from '../../../common';
import React, { useRef, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';

const DATA = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  title: `Item ${i + 1}`,
}));

const Item = ({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default function ScrollViewExample() {
  const [refreshing, setRefreshing] = useState(false);

  const ref = useRef<ScrollView>(null);

  const onRefresh = () => {
    setRefreshing(true);
    console.log(ref.current);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      ref={ref}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {DATA.map((item) => (
        <Item key={item.id} title={item.title} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  item: {
    backgroundColor: COLORS.PURPLE,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
  },
});

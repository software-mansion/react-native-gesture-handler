import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyExample() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 64, opacity: 0.25 }}>😞</Text>
      <Text style={{ fontSize: 24, opacity: 0.25 }}>It's so empty here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

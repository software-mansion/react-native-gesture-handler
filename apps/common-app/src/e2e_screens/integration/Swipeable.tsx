import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Swipeable'>;

export default function SwipeableScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swipeable Integration</Text>
      <View style={styles.content}>
        <Text style={styles.description}>
          Test swipeable component functionality
        </Text>
        <View style={styles.swipeableBox} testID="swipeable-box">
          <Text>Swipe left or right</Text>
        </View>
      </View>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        testID="swipeable-back">
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  swipeableBox: {
    width: 200,
    height: 60,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

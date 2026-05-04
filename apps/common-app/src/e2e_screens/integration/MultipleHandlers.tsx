import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = NativeStackScreenProps<any, 'MultipleHandlers'>;

export default function MultipleHandlersScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multiple Gesture Handlers</Text>
      <View style={styles.content}>
        <Text style={styles.description}>
          Test multiple gesture handlers on same component
        </Text>
        <View style={styles.multiBox} testID="multi-box">
          <Text>Tap, Pan, or Press</Text>
        </View>
      </View>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        testID="multi-back">
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
  multiBox: {
    width: 200,
    height: 200,
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9C27B0',
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

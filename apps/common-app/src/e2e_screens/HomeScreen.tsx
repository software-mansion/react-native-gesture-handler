import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E2E Tests</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Gesture Tests')}>
        <Text style={styles.buttonText}>Gesture Tests</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Integration Tests')}>
        <Text style={styles.buttonText}>Integration Tests</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

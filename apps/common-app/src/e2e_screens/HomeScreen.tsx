import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E2E Tests</Text>

      <Pressable
        testID="nav-gesture-tests"
        style={styles.button}
        onPress={() => navigation.navigate('Gesture Tests')}>
        <Text style={styles.buttonText}>Gesture Tests</Text>
      </Pressable>

      <Pressable
        testID="nav-integration-tests"
        style={styles.button}
        onPress={() => navigation.navigate('Integration Tests')}>
        <Text style={styles.buttonText}>Integration Tests</Text>
      </Pressable>

      <Pressable
        testID="nav-composition"
        style={styles.button}
        onPress={() => navigation.navigate('Composition & Interaction')}>
        <Text style={styles.buttonText}>Composition & Interaction</Text>
      </Pressable>

      <Pressable
        testID="nav-detecor-tests"
        style={styles.button}
        onPress={() => navigation.navigate('Gesture Detectors')}>
        <Text style={styles.buttonText}>Gesture Detectors</Text>
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

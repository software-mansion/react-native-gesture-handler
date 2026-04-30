import { StyleSheet } from 'react-native';

export const gestureStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    textAlign: 'center',
  },
  stateIndicator: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  buttonContainer: {
    justifyContent: 'center',
    marginBottom: 80,
  },
});

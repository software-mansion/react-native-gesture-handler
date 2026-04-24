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

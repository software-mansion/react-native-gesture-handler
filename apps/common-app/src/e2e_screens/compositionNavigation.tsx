import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function CompositionNavigation() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Composition & Interaction</Text>
      <View style={styles.list}>
        <Button
          title="Require to Fail"
          testID="nav-require-to-fail"
          onPress={() => navigation.navigate('Require to Fail')}
        />
        <Button
          title="Competing Gestures"
          testID="nav-competing-gestures"
          onPress={() => navigation.navigate('Competing Gestures')}
        />
        <Button
          title="Multiple Handlers"
          testID="nav-multiple"
          onPress={() => navigation.navigate('MultipleHandlers')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
});

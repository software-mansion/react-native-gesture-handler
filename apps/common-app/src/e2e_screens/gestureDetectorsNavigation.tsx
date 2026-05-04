import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function GestureDetectorsNavigation() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Detector Screens</Text>
      <View style={styles.list}>
        <Button
          title="Intercepting Gesture Detector"
          testID="nav-intercepting-gesture-detector"
          onPress={() => navigation.navigate('Intercepting Gesture Detector')}
        />
        <Button
          title="Virtual Gesture Detector"
          testID="nav-virtual-gesture-detector"
          onPress={() => navigation.navigate('Virtual Gesture Detector')}
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

import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function GesturesNavigation() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Screens</Text>
      <View style={styles.list}>
        <Button
          title="Tap"
          testID="nav-tap"
          onPress={() => navigation.navigate('Tap')}
        />
        <Button
          title="Pan"
          testID="nav-pan"
          onPress={() => navigation.navigate('Pan')}
        />
        <Button
          title="Pinch"
          testID="nav-pinch"
          onPress={() => navigation.navigate('Pinch')}
        />
        <Button
          title="Rotation"
          testID="nav-rotation"
          onPress={() => navigation.navigate('Rotation')}
        />
        <Button
          title="Long Press"
          testID="nav-long-press"
          onPress={() => navigation.navigate('Long Press')}
        />
        <Button
          title="Fling"
          testID="nav-fling"
          onPress={() => navigation.navigate('Fling')}
        />
        <Button
          title="Hover"
          testID="nav-hover"
          onPress={() => navigation.navigate('Hover')}
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

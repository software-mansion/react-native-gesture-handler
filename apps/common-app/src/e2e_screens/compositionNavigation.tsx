import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function CompositionNavigation() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Composition & Interaction</Text>
      <View style={styles.list}>
        <Button
          title="Drawer Layout"
          testID="nav-drawer"
          onPress={() => navigation.navigate('DrawerLayout')}
        />
        <Button
          title="Swipeable"
          testID="nav-swipeable"
          onPress={() => navigation.navigate('Swipeable')}
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

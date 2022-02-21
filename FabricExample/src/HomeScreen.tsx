import {Button, StyleSheet, View} from 'react-native';
import * as React from 'react';

export default function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Button
        onPress={() => navigation.navigate('OverviewExample')}
        title="Overview example"
      />
      <Button
        onPress={() => navigation.navigate('UltimateExample')}
        title="Ultimate example"
      />
      <Button
        onPress={() => navigation.navigate('ViewFlatteningExample')}
        title="View flattening example"
      />
      <Button
        onPress={() => navigation.navigate('ComponentsExample')}
        title="Components example"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

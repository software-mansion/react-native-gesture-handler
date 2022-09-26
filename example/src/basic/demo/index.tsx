import React from 'react';
import { StyleSheet, View } from 'react-native';

import Character from './character';

export default class Demo extends React.Component {
  render(): React.ReactNode {
    return (
      <View style={styles.container}>
        <Character />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'rgba(33,33,33,1)',
  },
});

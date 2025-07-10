import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PipLayout } from './pipLayout';

const App = () => {
  const fakeData = Array(50)
    .fill(0)
    .map((value: number, index) => value + index);

  const onItemPress = (item: number) => {
    Alert.alert('Item pressed', `Item #${item}`);
  };

  const onPlayPress = () => {
    Alert.alert('Play press');
  };

  const renderItem = ({ item }: { item: number }) => {
    return (
      <TouchableOpacity onPress={() => onItemPress(item)}>
        <Text style={styles.row}>{`Item #${item}`}</Text>
      </TouchableOpacity>
    );
  };

  const renderPlayButton = () => {
    return (
      <View style={styles.player}>
        <TouchableOpacity onPress={onPlayPress}>
          <View style={styles.playButton} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <FlatList
          data={fakeData}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item) => item.toString()}
        />
      </SafeAreaView>
      <PipLayout player={renderPlayButton()} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  row: {
    padding: 20,
    backgroundColor: 'lightblue',
  },
  separator: {
    height: 1,
    color: 'white',
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: 'blue',
  },
});

export default App;

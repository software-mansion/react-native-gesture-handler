import * as React from 'react';
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { DraggableBox } from '../../basic/draggable';
import { useState } from 'react';

export default function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  function ToggleModalButton() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible((visible) => !visible)}>
        <Text>{isModalVisible ? 'Close' : 'Open'} modal</Text>
      </TouchableOpacity>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.description}>
        DraggableBox inside modal should be moveable
      </Text>
      <ToggleModalButton />
      <Modal visible={isModalVisible}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalView}>
            <DraggableBox />
            <ToggleModalButton />
          </View>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    marginTop: 200,
    backgroundColor: 'transparent',
    borderRadius: 6,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  description: {
    margin: 20,
  },
  button: {
    borderWidth: 2,
    padding: 10,
  },
});

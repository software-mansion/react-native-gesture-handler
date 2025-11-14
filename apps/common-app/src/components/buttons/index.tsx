import { StyleSheet, Text } from 'react-native';
import {
  BaseButton,
  BorderlessButton,
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';

type ButtonWrapperProps = {
  ButtonComponent:
    | typeof BaseButton
    | typeof RectButton
    | typeof BorderlessButton;

  color: string;
};

function ButtonWrapper({ ButtonComponent, color }: ButtonWrapperProps) {
  return (
    <ButtonComponent
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => console.log(`[${ButtonComponent.name}] Hello World!`)}>
      <Text style={styles.buttonText}>{ButtonComponent.name}</Text>
    </ButtonComponent>
  );
}

export default function ButtonsExample() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ButtonWrapper ButtonComponent={BaseButton} color="#2196F3" />
      <ButtonWrapper ButtonComponent={RectButton} color="#f44336" />
      <ButtonWrapper ButtonComponent={BorderlessButton} color="#ff9800" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  button: {
    width: 200,
    height: 50,
    borderRadius: 15,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

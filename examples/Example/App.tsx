import React from 'react';
import {Text, View, FlatList, StyleSheet} from 'react-native';
import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import {NavigationContainer, ParamListBase} from '@react-navigation/native';
import {RectButton, ScrollView} from 'react-native-gesture-handler';

import Rows from './rows';

const SCREENS = {
  Rows: {component: Rows, title: 'Table rows & buttons'},
};

type RootStackParamList = {
  Home: undefined;
} & {
  [P in keyof typeof SCREENS]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{title: '✌️ Gesture Handler Demo'}}
          component={MainScreen}
        />
        {(Object.keys(SCREENS) as (keyof typeof SCREENS)[]).map(name => (
          <Stack.Screen
            key={name}
            name={name}
            getComponent={() => SCREENS[name].component}
            options={{title: SCREENS[name].title}}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainScreen({navigation}: StackScreenProps<ParamListBase>) {
  const data = (Object.keys(SCREENS) as (keyof typeof SCREENS)[]).map(key => {
    const item = SCREENS[key];
    return {key, title: item.title || key};
  });

  return (
    <FlatList
      style={styles.list}
      data={data}
      ItemSeparatorComponent={ItemSeparator}
      renderItem={props => (
        <MainScreenItem
          {...props}
          onPressItem={({key}: {key: string}) => navigation.navigate(key)}
        />
      )}
      renderScrollComponent={props => <ScrollView {...props} />}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

type MainScreenItemType = {
  item: {key: string; title: string};
  onPressItem: (item: {key: string}) => void;
}

function MainScreenItem(props: MainScreenItemType) {
  const {title} = props.item;
  return (
    <RectButton
      style={[styles.button]}
      onPress={() => props.onPressItem(props.item)}>
      <Text style={styles.buttonText}>{title}</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#EFEFF4',
  },
  separator: {
    height: 1,
    backgroundColor: '#DBDBE0',
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    height: 60,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

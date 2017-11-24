import React from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { StackNavigator } from 'react-navigation';
import {
  RectButton,
  ScrollView,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

import SwipeableTable from './swipeable';
import Rows from './rows';
import Multitap from './multitap';
import Draggable from './draggable';
import ScaleAndRotate from './scaleAndRotate';
import PagerAndDrawer from './pagerAndDrawer';
import PanAndScroll from './panAndScroll';
import PanResponder from './panResponder';
import Bouncing from './bouncing';
import HorizontalDrawer from './horizontalDrawer';
import ChatHeads from './chatHeads';
import { ComboWithGHScroll, ComboWithRNScroll } from './combo';

const SCREENS = {
  Rows: { screen: Rows, title: 'Table rows & buttons' },
  Multitap: { screen: Multitap },
  Draggable: { screen: Draggable },
  ScaleAndRotate: { screen: ScaleAndRotate, title: 'Scale, rotate & tilt' },
  PagerAndDrawer: { screen: PagerAndDrawer, title: 'Android pager & drawer' },
  HorizontalDrawer: {
    screen: HorizontalDrawer,
    title: 'Gesture handler based DrawerLayout',
  },
  SwipeableTable: {
    screen: SwipeableTable,
    title: 'Gesture handler based SwipeableRow',
  },
  PanAndScroll: {
    screen: PanAndScroll,
    title: 'Horizontal pan or tap in ScrollView',
  },
  PanResponder: { screen: PanResponder },
  Bouncing: { screen: Bouncing, title: 'Twist & bounce back animation' },
  // ChatHeads: {
  //   screen: ChatHeads,
  //   title: 'Chat Heads (no native animated support yet)',
  // },
  Combo: { screen: ComboWithGHScroll },
  ComboWithRNScroll: {
    screen: ComboWithRNScroll,
    title: "Combo with RN's ScrollView",
  },
};

class MainScreen extends React.Component {
  static navigationOptions = {
    title: '✌️ Gesture Handler Demo',
  };
  render() {
    const data = Object.keys(SCREENS).map(key => ({ key }));
    return (
      <FlatList
        style={styles.list}
        data={data}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={props => (
          <MainScreenItem
            {...props}
            onPressItem={({ key }) => this.props.navigation.navigate(key)}
          />
        )}
        renderScrollComponent={props => <ScrollView {...props} />}
      />
    );
  }
}

const ItemSeparator = () => <View style={styles.separator} />;

class MainScreenItem extends React.Component {
  _onPress = () => this.props.onPressItem(this.props.item);
  render() {
    const { key } = this.props.item;
    return (
      <RectButton style={styles.button} onPress={this._onPress}>
        <Text style={styles.buttonText}>{SCREENS[key].title || key}</Text>
      </RectButton>
    );
  }
}

const ExampleApp = StackNavigator(
  {
    Main: { screen: MainScreen },
    ...SCREENS,
  },
  {
    initialRouteName: 'Main',
  }
);

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

export default ExampleApp;

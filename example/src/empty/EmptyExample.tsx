import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import Slide from './Slide';

const ThirdRoute = () => (
  <View style={styles.thirdRouteRoot}>
    <Slide
      dataSource={Array.from({ length: 10 })}
      renderItem={(index) => (
        <View style={styles.textView}>
          <Text>{index}</Text>
        </View>
      )}
    />
  </View>
);

const FourRoute = () => <View style={styles.fourthRouteRoot} />;

const renderScene2 = SceneMap({
  third: ThirdRoute,
  four: FourRoute,
});

const SecondRoute = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'third', title: 'Third' },
    { key: 'four', title: 'Four' },
  ]);

  return (
    <View style={styles.secondRouteRoot}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene2}
        onIndexChange={setIndex}
        swipeEnabled={false}
        animationEnabled={false}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

const FirstRoute = () => (
  <View style={styles.firstRouteRoot}>
    <Slide
      dataSource={Array.from({ length: 10 })}
      renderItem={(index) => {
        return (
          <View style={styles.cardIndexWrapper}>
            <Text>{index.toFixed()}</Text>
          </View>
        );
      }}
    />
  </View>
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

export default function App() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  return (
    <View style={styles.root}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        swipeEnabled={false}
        animationEnabled={false}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 100,
  },
  firstRouteRoot: {
    flex: 1,
    backgroundColor: '#ff4081',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondRouteRoot: {
    flex: 1,
    backgroundColor: '#673ab7',
  },
  thirdRouteRoot: {
    flex: 1,
    backgroundColor: '#ff4081',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fourthRouteRoot: {
    flex: 1,
    backgroundColor: '#673ab7',
  },
  cardIndexWrapper: {
    borderWidth: 2,
    height: 200,
  },
  textView: {
    borderWidth: 2,
    height: 200,
  },
});

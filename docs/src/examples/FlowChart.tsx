import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ChartManager from './ChartManager';
import { Grid } from '@mui/material';
import ChartElement from './ChartElement';
import Arrow from './Arrow';

type Coordinate = {
  x: number;
  y: number;
};

export default function App(props: { chartManager: ChartManager }) {
  const currentChartManager = props.chartManager;
  const elementsRef = useRef([]);
  const elementsCoordsRef = useRef([]);
  const rootRef = useRef(null);

  const getCenter = (side: number, size: number) => side + size / 2;

  useEffect(() => {
    currentChartManager.elements.forEach((element) => {
      currentChartManager.addListener(element.id, (isActive) => {
        elementsRef.current[element.id].style.backgroundColor = isActive
          ? '#ffe04b'
          : '#b58df1';
      });
    });

    elementsCoordsRef.current = elementsRef.current.map((element) => {
      const box = element.getBoundingClientRect();
      const root = rootRef.current.getBoundingClientRect();
      return {
        x: getCenter(box.left, box.width) - root.left,
        y: getCenter(box.top, box.height) - root.top,
      } as Coordinate;
    });

    console.log(elementsRef.current);
  }, [currentChartManager]);

  // get each listener, pass them to the Element, they will change their color on input
  return (
    <View style={styles.container} ref={rootRef}>
      <Grid container spacing={4}>
        {currentChartManager.elements.map((element) => (
          <ChartElement
            key={element.id}
            innerRef={(el) => (elementsRef.current[element.id] = el)}
            id={element.id}
            state={element.state}
            label={element.label}
          />
        ))}
      </Grid>
      {currentChartManager.connections.map((connection) => (
        <Arrow
          key={connection.id}
          startPoint={{
            x: elementsCoordsRef.current[connection.from].x,
            y: elementsCoordsRef.current[connection.from].y,
          }}
          endPoint={{
            x: elementsCoordsRef.current[connection.to].x,
            y: elementsCoordsRef.current[connection.to].y,
          }}></Arrow>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 40,
    paddingTop: 0,
  },
  box: {
    flex: 1,
    flexDirection: 'column',
    textAlign: 'center',
  },
  element: {
    padding: 30,
    fontWeight: '500',
    fontSize: 24,
    backgroundColor: '#b58df1',
  },
  subtext: {
    fontWeight: '300',
    fontSize: 14,
  },
});

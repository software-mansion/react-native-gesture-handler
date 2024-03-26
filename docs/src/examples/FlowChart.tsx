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

  currentChartManager.elements.forEach((element) => {
    currentChartManager.addListener(element.id, (isActive) => {
      if (elementsRef.current[element.id])
        elementsRef.current[element.id].style.backgroundColor = isActive
          ? '#ffe04b'
          : '#b58df1';
    });
  });

  elementsCoordsRef.current = elementsRef.current.map((element) => {
    // during unloading or overresizing, element may reload itself, causing it to be undefineds
    if (!element) {
      return {
        x: 0,
        y: 0,
      } as Coordinate;
    }

    const box = element.getBoundingClientRect();
    const root = rootRef.current.getBoundingClientRect();
    return {
      x: getCenter(box.left, box.width) - root.left,
      y: getCenter(box.top, box.height) - root.top,
    } as Coordinate;
  });

  // get each listener, pass them to the Element, they will change their color on input
  return (
    <View style={styles.container} ref={rootRef}>
      <Grid container rowGap={4}>
        {currentChartManager.layout.map((row, index) => (
          <Grid container spacing={4} key={index}>
            {row
              .map((elementId) => currentChartManager.elements[elementId])
              .map((element, index) => (
                <ChartElement
                  key={index}
                  innerRef={(el) => (elementsRef.current[element.id] = el)}
                  id={element.id}
                  label={element.label}
                  subtext={element.subtext}
                  isVisible={element.isVisible}
                  isHeader={element.isHeader}
                />
              ))}
          </Grid>
        ))}
      </Grid>
      {elementsCoordsRef.current.length > 0 &&
        currentChartManager.connections.map((connection, idx) => {
          // we have all the connections layed out,
          // but the user may choose not to use some of the available elements,
          if (
            !elementsCoordsRef.current[connection.from] ||
            !elementsCoordsRef.current[connection.to]
          ) {
            return <View key={idx}></View>;
          }
          return (
            <Arrow
              key={connection.id}
              startPoint={{
                x: elementsCoordsRef.current[connection.from].x, // GAH
                y: elementsCoordsRef.current[connection.from].y,
              }}
              endPoint={{
                x: elementsCoordsRef.current[connection.to].x,
                y: elementsCoordsRef.current[connection.to].y,
              }}></Arrow>
          );
        })}
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

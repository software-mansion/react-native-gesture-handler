import 'react-native-gesture-handler';
import React, { useRef } from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';
import ChartManager from './ChartManager';
import { Grid } from '@mui/material';
import ChartElement from './ChartElement';
import Arrow from './Arrow';

type Coordinate = {
  x: number;
  y: number;
};

type FlowChartProps = {
  chartManager: ChartManager;
  primaryColor: string;
  highlightColor: string;
  isFontReduced: boolean;
};

export default function App({
  chartManager,
  primaryColor,
  highlightColor,
  isFontReduced,
}: FlowChartProps) {
  const elementsRef = useRef([]);
  const elementsCoordsRef = useRef([]);
  const rootRef = useRef(null);

  const getCenter = (side: number, size: number) => side + size / 2;

  elementsCoordsRef.current = elementsRef.current.map((element) => {
    // during unloading or overresizing, element may reload itself, causing it to be undefined
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

  const tinyFontStyle = {
    fontSize: 16,
  } as StyleProp<any>;

  return (
    <View style={styles.container} ref={rootRef}>
      <Grid container rowGap={4}>
        {chartManager.layout.map((row, index) => (
          <Grid container spacing={4} key={index}>
            {row
              .map((elementId) => chartManager.elements[elementId])
              .map((element, index) => (
                <ChartElement
                  key={index}
                  innerRef={(el) => (elementsRef.current[element.id] = el)}
                  elementData={element}
                  primaryColor={primaryColor}
                  highlightColor={highlightColor}
                  chartManager={chartManager}
                  style={isFontReduced ? tinyFontStyle : null}
                />
              ))}
          </Grid>
        ))}
      </Grid>
      {elementsCoordsRef.current.length > 0 &&
        chartManager.connections.map((connection) => {
          // we have all the connections layed out,
          // but the user may choose not to use some of the available elements,
          if (
            !elementsCoordsRef.current[connection.from] ||
            !elementsCoordsRef.current[connection.to]
          ) {
            return <View key={connection.id}></View>;
          }
          return (
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
  },
  subtext: {
    fontWeight: '300',
    fontSize: 14,
  },
});

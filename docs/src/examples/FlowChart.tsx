import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ChartManager from './ChartManager';
import { Grid } from '@mui/material';
import ChartElement from './ChartElement';

export default function App(props: { chartManager: ChartManager }) {
  const currentChartManager = props.chartManager;
  const elementsRef = useRef([]);

  useEffect(() => {
    currentChartManager.elements.forEach((element) => {
      currentChartManager.addListener(element.id, (isActive) => {
        elementsRef.current[element.id].style.backgroundColor = isActive
          ? '#ffe04b'
          : '#b58df1';
      });
    });
  }, [currentChartManager]);

  // get each listener, pass them to the Element, they will change their color on input
  return (
    <View style={styles.container}>
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

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChartManager from './ChartManager';
import { Grid } from '@mui/material';
import ChartItem from './ChartItem';
import Arrow from './Arrow';

type Coordinate = {
  x: number;
  y: number;
};

type FlowChartProps = {
  chartManager: ChartManager;
};

export default function FlowChart({ chartManager }: FlowChartProps) {
  const itemsRef = useRef<View[]>([]);
  const itemsCoordsRef = useRef<Coordinate[]>([]);
  const rootRef = useRef<View>(null);

  // Arrows are not shown on the first render on production builds.
  // This `counter` forces a re-render after the component is mounted.
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCounter(counter + 1);
    }, 0);
    return () => clearTimeout(timeout);
  }, [counter]);

  const getCenter = (side: number, size: number) => side + size / 2;

  itemsCoordsRef.current = itemsRef.current.map((element: View | undefined) => {
    // During unloading or reresizing, element may reload itself, causing it to be undefined
    if (!element) {
      return {
        x: 0,
        y: 0,
      } as Coordinate;
    }

    const htmlElement = element as unknown as HTMLElement;
    const htmlRootElement = rootRef.current as unknown as HTMLElement;

    const box = htmlElement.getBoundingClientRect();
    const root = htmlRootElement.getBoundingClientRect();

    return {
      x: getCenter(box.left, box.width) - root.left,
      y: getCenter(box.top, box.height) - root.top,
    } as Coordinate;
  });

  return (
    <View style={styles.container} ref={rootRef}>
      <Grid container rowGap={4}>
        {chartManager.layout.map((row) => (
          <Grid container spacing={4} key={row.toString()}>
            {row
              .map((itemId) => chartManager.items[itemId])
              .map((item) => (
                <ChartItem
                  key={item.id}
                  innerRef={(el) => {
                    itemsRef.current[item.id] = el;
                  }}
                  item={item}
                  chartManager={chartManager}
                />
              ))}
          </Grid>
        ))}
      </Grid>
      {chartManager.connections.map((connection) => {
        // we have all the connections layed out,
        // but the user may choose not to use some of the available items,
        if (
          !itemsCoordsRef.current[connection.from] ||
          !itemsCoordsRef.current[connection.to]
        ) {
          return <View key={connection.id} />;
        }
        return (
          <Arrow
            key={connection.id}
            startPoint={{
              x: itemsCoordsRef.current[connection.from].x,
              y: itemsCoordsRef.current[connection.from].y,
            }}
            endPoint={{
              x: itemsCoordsRef.current[connection.to].x,
              y: itemsCoordsRef.current[connection.to].y,
            }}
          />
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
    paddingHorizontal: 40,
  },
});

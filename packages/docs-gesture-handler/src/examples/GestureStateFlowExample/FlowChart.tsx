import { useCallback, useMemo, useReducer, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ChartManager from './ChartManager';
import { Grid } from '@mui/material';
import ChartItem, { Coordinate } from './ChartItem';
import Arrow from './Arrow';

type FlowChartProps = {
  chartManager: ChartManager;
};

export default function FlowChart({ chartManager }: FlowChartProps) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const coordinates = useMemo<Map<number, Coordinate>>(() => new Map(), []);
  const rootRef = useRef<View>(null);

  const updateCoordinates = useCallback(
    (id: number, coordinate: Coordinate) => {
      const htmlRootElement = rootRef.current as unknown as HTMLElement;
      const root = htmlRootElement.getBoundingClientRect();

      if (!root) {
        return;
      }

      // Adjust to root relative positioning
      coordinates.set(id, {
        x: coordinate.x - root.left,
        y: coordinate.y - root.top,
      });
      forceUpdate();
    },
    [coordinates]
  );

  return (
    <View style={styles.container} ref={rootRef}>
      <Grid container rowGap={4}>
        {chartManager.layout?.map((row) => (
          <Grid container width={'100%'} spacing={4} key={row.toString()}>
            {row
              .map((itemId) => chartManager.items[itemId])
              .map((item) => (
                <ChartItem
                  key={item.id}
                  updateCoordinates={updateCoordinates}
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
          !coordinates.get(connection.from) ||
          !coordinates.get(connection.to)
        ) {
          return <View key={connection.id} />;
        }

        return (
          <Arrow
            key={connection.id}
            startPoint={{
              x: coordinates.get(connection.from).x,
              y: coordinates.get(connection.from).y,
            }}
            endPoint={{
              x: coordinates.get(connection.to).x,
              y: coordinates.get(connection.to).y,
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

import React from 'react';
import { DataSet } from 'vis-network/standalone';
import FlowChart from './FlowChart';

const nodes = new DataSet([
  {
    id: 1,
    label: 'onTouchesDown',
    level: 0,
  },
  {
    id: 2,
    label: 'onTouchesMove',
    level: 1,
  },
  {
    id: 3,
    label: 'onTouchesUp',
    level: 2,
  },
  {
    id: 4,
    label: 'onTouchesCancel',
    level: 2,
  },
]);

const edges = new DataSet([
  { from: 1, to: 2, arrows: 'to' },
  { from: 1, to: 3, arrows: 'to' },
  { from: 2, to: 2, arrows: 'to' },
  { from: 2, to: 3, arrows: 'to' },
  { from: 1, to: 4, arrows: 'to' },
  { from: 2, to: 4, arrows: 'to' },
]);

export function TouchEventFlowChart() {
  return <FlowChart nodes={nodes} edges={edges} />;
}

import React from 'react';
import { DataSet } from 'vis-network/standalone';
import FlowChart from './FlowChart';

const nodes = new DataSet([
  {
    id: 1,
    label: 'onBegin',
    level: 0,
  },
  {
    id: 2,
    label: 'onActivate',
    level: 1,
  },
  {
    id: 3,
    label: 'onUpdate',
    level: 2,
  },
  {
    id: 4,
    label: 'onDeactivate',
    level: 3,
  },
  {
    id: 5,
    label: 'onFinalize',
    level: 3,
  },
]);

const edges = new DataSet([
  { from: 1, to: 2, arrows: 'to' },
  { from: 1, to: 5, arrows: 'to' },
  { from: 2, to: 3, arrows: 'to' },
  { from: 2, to: 4, arrows: 'to' },
  { from: 3, to: 3, arrows: 'to' },
  { from: 3, to: 4, arrows: 'to' },
  { from: 4, to: 5, arrows: 'to' },
]);

export function GestureEventFlowChart() {
  return <FlowChart nodes={nodes} edges={edges} />;
}

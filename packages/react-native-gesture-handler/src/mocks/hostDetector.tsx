import type { ComponentType } from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

type HostGestureDetectorMockProps = ViewProps & {
  handlerTags?: number[];
};

const HostGestureDetector = View as ComponentType<HostGestureDetectorMockProps>;

export default HostGestureDetector;

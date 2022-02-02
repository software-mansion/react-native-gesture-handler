import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
export default function gestureHandlerRootHOC<P>(Component: React.ComponentType<P>, containerStyles?: StyleProp<ViewStyle>): React.ComponentType<P>;

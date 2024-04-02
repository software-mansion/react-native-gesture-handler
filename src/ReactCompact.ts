import { findDOMNode } from 'react-dom';

export const findNodeHandle = findDOMNode;
export const Platform = { OS: 'web' };
export const NativeModules = {};
export const isDEV = process.env.NODE_ENV === 'development';

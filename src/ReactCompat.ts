import { findDOMNode } from 'react-dom';

export const findNodeHandle = findDOMNode;
export const Platform = { OS: 'web' };
export const NativeModules = {};
export const isDEV = process.env.NODE_ENV === 'development';
export const DeviceEventEmitter = {
  addListener: (_a: string, _b: unknown) => null,
};
export type EmitterSubscription = unknown;
export const UIManager = {};

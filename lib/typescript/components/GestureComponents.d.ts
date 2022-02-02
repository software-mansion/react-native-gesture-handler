import * as React from 'react';
import { PropsWithChildren, ForwardedRef, RefAttributes, ReactElement } from 'react';
import { ScrollView as RNScrollView, ScrollViewProps as RNScrollViewProps, Switch as RNSwitch, SwitchProps as RNSwitchProps, TextInput as RNTextInput, TextInputProps as RNTextInputProps, DrawerLayoutAndroid as RNDrawerLayoutAndroid, DrawerLayoutAndroidProps as RNDrawerLayoutAndroidProps, FlatList as RNFlatList, FlatListProps as RNFlatListProps } from 'react-native';
import { NativeViewGestureHandlerProps } from '../handlers/NativeViewGestureHandler';
export declare const ScrollView: React.ForwardRefExoticComponent<RNScrollViewProps & {
    children?: React.ReactNode;
} & NativeViewGestureHandlerProps & React.RefAttributes<React.ComponentType<any>>>;
export declare type ScrollView = typeof ScrollView & RNScrollView;
export declare const Switch: React.ForwardRefExoticComponent<RNSwitchProps & NativeViewGestureHandlerProps & React.RefAttributes<React.ComponentType<any>>>;
export declare type Switch = typeof Switch & RNSwitch;
export declare const TextInput: React.ForwardRefExoticComponent<RNTextInputProps & NativeViewGestureHandlerProps & React.RefAttributes<React.ComponentType<any>>>;
export declare type TextInput = typeof TextInput & RNTextInput;
export declare const DrawerLayoutAndroid: React.ForwardRefExoticComponent<RNDrawerLayoutAndroidProps & {
    children?: React.ReactNode;
} & NativeViewGestureHandlerProps & React.RefAttributes<React.ComponentType<any>>>;
export declare type DrawerLayoutAndroid = typeof DrawerLayoutAndroid & RNDrawerLayoutAndroid;
export declare const FlatList: <ItemT = any>(props: React.PropsWithChildren<RNFlatListProps<ItemT> & React.RefAttributes<FlatList<ItemT>> & NativeViewGestureHandlerProps>, ref: React.ForwardedRef<FlatList<ItemT>>) => ReactElement | null;
export declare type FlatList<ItemT = any> = typeof FlatList & RNFlatList<ItemT>;

import * as React from 'react';
import { BaseGestureHandlerProps } from './gestureHandlerCommon';
declare type CreateHandlerArgs<HandlerPropsT extends Record<string, unknown>> = Readonly<{
    name: string;
    allowedProps: Readonly<Extract<keyof HandlerPropsT, string>[]>;
    config: Readonly<Record<string, unknown>>;
    transformProps?: (props: HandlerPropsT) => HandlerPropsT;
    customNativeProps?: Readonly<string[]>;
}>;
export default function createHandler<T extends BaseGestureHandlerProps<U>, U extends Record<string, unknown>>({ name, allowedProps, config, transformProps, customNativeProps, }: CreateHandlerArgs<T>): React.ComponentType<T & React.RefAttributes<any>>;
export {};

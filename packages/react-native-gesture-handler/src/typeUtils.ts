export type ValueOf<T> = T[keyof T];

export type StaticAssert<T extends true> = T;

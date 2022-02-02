export declare const isnan: (v: unknown) => boolean;
export declare const isValidNumber: (v: unknown) => boolean;
export declare const TEST_MIN_IF_NOT_NAN: (value: number, limit: number) => boolean;
export declare const VEC_LEN_SQ: ({ x, y }?: {
    x?: number | undefined;
    y?: number | undefined;
}) => number;
export declare const TEST_MAX_IF_NOT_NAN: (value: number, max: number) => boolean;
export declare function fireAfterInterval(method: () => void, interval?: number | boolean): number | null;

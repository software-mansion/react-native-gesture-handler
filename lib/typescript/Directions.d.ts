export declare const Directions: {
    readonly RIGHT: 1;
    readonly LEFT: 2;
    readonly UP: 4;
    readonly DOWN: 8;
};
export declare type Directions = typeof Directions[keyof typeof Directions];

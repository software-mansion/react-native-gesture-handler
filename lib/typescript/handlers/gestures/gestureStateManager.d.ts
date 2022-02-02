export interface GestureStateManagerType {
    begin: () => void;
    activate: () => void;
    fail: () => void;
    end: () => void;
}
export declare const GestureStateManager: {
    create(handlerTag: number): GestureStateManagerType;
};

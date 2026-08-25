export const PointerType = {
  TOUCH: 0,
  STYLUS: 1,
  MOUSE: 2,
  KEY: 3,
  OTHER: 4,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PointerType = (typeof PointerType)[keyof typeof PointerType];

export const HoverEffect = {
  NONE: 0,
  LIFT: 1,
  HIGHLIGHT: 2,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type HoverEffect = (typeof HoverEffect)[keyof typeof HoverEffect];

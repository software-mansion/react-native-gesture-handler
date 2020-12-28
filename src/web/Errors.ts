/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// @ts-nocheck TODO(TS) provide types
export class GesturePropError extends Error {
  constructor(name: string, value: any, expectedType: string) {
    super(
      `Invalid property \`${name}: ${value}\` expected \`${expectedType}\``
    );
  }
}

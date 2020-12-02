export class GesturePropError extends Error {
  constructor(name: string, value: any, expectedType: string) {
    super(
      `Invalid property \`${name}: ${value}\` expected \`${expectedType}\``
    );
  }
}

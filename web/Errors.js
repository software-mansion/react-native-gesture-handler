export class GesturePropError extends Error {
  constructor(name, value, expectedType) {
    super(`Invalid property \`${name}: ${value}\` expected \`${expectedType}\``);
  }
}

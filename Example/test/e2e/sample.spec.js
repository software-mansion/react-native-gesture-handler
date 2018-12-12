describe('Example', () => {
  beforeEach(async () => {
    if (typeof device === 'undefined') {
      const detox = require('detox');
      const config = require('../../package.json').detox;
      await detox.init(config);
    }
    // XD
    await device.reloadReactNative();
  });
  it('should pass', async () => {
    await expect(element(by.text('Scale, rotate & tilt & more'))).toExist();
  });
});

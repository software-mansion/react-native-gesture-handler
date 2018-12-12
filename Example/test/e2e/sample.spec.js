describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  it('should pass', async () => {
    await expect(element(by.text('Scale, rotate & tilt & more'))).toExist();
  });
});

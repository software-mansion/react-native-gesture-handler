describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  it('should pass', async () => {
    await expect(element(by.id('nie ma'))).toNotExist();
  });
});

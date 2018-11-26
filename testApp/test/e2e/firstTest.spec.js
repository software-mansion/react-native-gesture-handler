describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await device.disableSynchronization();
  });

  it('should pass', async () => {
    await expect(element(by.id('nie ma'))).toNotExist();
  });
});

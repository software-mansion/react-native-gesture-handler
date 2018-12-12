describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have some button', async () => {
    await expect(element(by.text('Scale, rotate & tilt'))).toExist();
  });

  it('should not lie', async () => {
    await expect(
      element(by.text('Michał Osadnik writes decent code'))
    ).toNotExist();
  });
});

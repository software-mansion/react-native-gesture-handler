describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('test double tap', async () => {
    const el = element(by.text('Multitap'));
    await expect(el).toExist();
    await el.tap();
    const rect = element(by.id('rectangle'));
    await expect(rect).toExist();
    await rect.multiTap(2);
    const longPressModal = element(by.text('Double tap has been activated'));
    await expect(longPressModal).toExist();
  });

  it('test long tap', async () => {
    const el = element(by.text('Multitap'));
    await expect(el).toExist();
    await el.tap();
    const rect = element(by.id('rectangle'));
    await expect(rect).toExist();
    await rect.longPress(5000);
    const longPressModal = element(by.text('Long press has been activated'));
    await expect(longPressModal).toExist();
  });
});

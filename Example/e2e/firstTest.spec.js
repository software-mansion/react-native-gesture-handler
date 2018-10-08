describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should render main menu', async () => {
    await expect(element(by.id('main_menu'))).toBeVisible();
  });

  it('should show another screen after tap', async () => {
    await element(by.id('main_screen_item_Rows')).tap();
    await expect(
      element(by.text('Swipe this row & observe highlight delay'))
    ).toBeVisible();
  });
});

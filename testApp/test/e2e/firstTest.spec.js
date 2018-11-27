describe('Example', () => {
  beforeEach(() => {
    device.reloadReactNative();
  });

  it('should pass', () => {
    expect(element(by.id('nie ma'))).toNotExist();
  });

  it('should render main menu', () => {
    expect(element(by.id('main_menu'))).toBeVisible();
  });
});

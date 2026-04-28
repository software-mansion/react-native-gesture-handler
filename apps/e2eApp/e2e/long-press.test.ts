import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect, waitFor } from "detox";
import { LONG_PRESS_DURATION } from "../../common-app/src/e2e_screens/testConstants";

describe("test long press gesture", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id("nav-long-press")).tap();
  });

  const wrongElement = element(by.id("wrong-element"));
  const longPressElement = element(by.id("long-press-idle"));
  const longPressActivatedElement = element(by.id("long-press-activated"));
  const resetButton = element(by.id("reset"));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it("shouldn`t register a long press gesture on tap", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.tap();
    await expect(longPressActivatedElement).not.toExist();
  });

  it("shouldn`t register a long press gesture on different element", async () => {
    await expect(wrongElement).toExist();
    await wrongElement.longPress(LONG_PRESS_DURATION);
    await expect(longPressActivatedElement).not.toExist();
  });

  it("should register a long press gesture with correct duration", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.longPress(LONG_PRESS_DURATION + 10);// Adding a small buffer to ensure the gesture is recognized
    await expect(longPressActivatedElement).toExist();
  });

  it("should register a long press gesture with longer duration", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.longPress(LONG_PRESS_DURATION + 100);
    await expect(longPressActivatedElement).toExist();
  });

  it("shouldnt register a long press gesture with shorter duration", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.longPress(LONG_PRESS_DURATION - 100);
    await expect(longPressActivatedElement).not.toExist();
  });

});

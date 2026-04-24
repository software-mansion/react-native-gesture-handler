import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect, waitFor } from "detox";

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
    await wrongElement.longPress(800);
    await expect(longPressActivatedElement).not.toExist();
  });

  it("should register a long press gesture", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.longPress(800);
    await expect(longPressActivatedElement).toExist();
  });

  it("multiple taps shouldn`t register a long press gesture", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.multiTap(3);
    await expect(longPressActivatedElement).not.toExist();
  });

  it("shouldnt change state due to multiple long presses", async () => {
    await expect(longPressElement).toExist();
    await longPressElement.longPress(800);
    await longPressActivatedElement.longPress(800);
    await expect(longPressActivatedElement).toExist();
  });
});

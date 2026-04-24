import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect } from "detox";

describe("test pinch gesture", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id("nav-pinch")).tap();
  });

  const wrongElement = element(by.id("wrong-element"));
  const pinchElement = element(by.id("pinch-idle"));
  const pinchActivatedElement = element(by.id("pinch-activated"));
  const resetButton = element(by.id("reset"));

  beforeEach(async () => {
    await expect(element(by.id("reset"))).toExist();
    await resetButton.tap();
  });

  it("shouldn`t register a pinch gesture on tap", async () => {
    await expect(pinchElement).toExist();
    await pinchElement.tap();
    await expect(pinchActivatedElement).not.toExist();
  });

  it("shouldn`t register a pinch gesture on different element", async () => {
    await expect(wrongElement).toExist();
    await wrongElement.pinch(1.5, "fast");
    await expect(pinchActivatedElement).not.toExist();
  });

  it("should register a pinch gesture", async () => {
    await expect(pinchElement).toExist();
    await pinchElement.pinch(1.5, "fast");
    await expect(pinchActivatedElement).toExist();
  });

  it("multiple taps shouldn`t register a pinch gesture", async () => {
    await expect(pinchElement).toExist();
    await pinchElement.multiTap(3);
    await expect(pinchActivatedElement).not.toExist();
  });

  it("shouldnt change state due to multiple pinches", async () => {
    await expect(pinchElement).toExist();
    await pinchElement.pinch(1.5, "fast");
    await pinchActivatedElement.pinch(1.2, "fast");
    await expect(pinchActivatedElement).toExist();
  });
});

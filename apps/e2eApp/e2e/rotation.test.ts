import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect } from "detox";

describe("test rotation gesture", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id("nav-rotation")).tap();
  });

  const wrongElement = element(by.id("wrong-element"));
  const rotationElement = element(by.id("rotation-idle"));
  const rotationActivatedElement = element(by.id("rotation-activated"));
  const resetButton = element(by.id("reset"));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it("shouldn`t register a rotation gesture on tap", async () => {
    await expect(rotationElement).toExist();
    await rotationElement.tap();
    await expect(rotationActivatedElement).not.toExist();
  });

  it("shouldn`t register a rotation gesture on different element", async () => {
    await expect(wrongElement).toExist();
    await wrongElement.pinch(1.2, "fast", 0.8);
    await expect(rotationActivatedElement).not.toExist();
  });

  it("should register a rotation gesture", async () => {
    await expect(rotationElement).toExist();
    await rotationElement.pinch(1.2, "slow", 1.2);
    await expect(rotationActivatedElement).toExist();
  });

  it("multiple taps shouldn`t register a rotation gesture", async () => {
    await expect(rotationElement).toExist();
    await rotationElement.multiTap(3);
    await expect(rotationActivatedElement).not.toExist();
  });

  it("shouldnt change state due to multiple rotations", async () => {
    await expect(rotationElement).toExist();
    await rotationElement.pinch(1.2, "slow", 1.2);
    await rotationActivatedElement.pinch(1.1, "slow", 1.1);
    await expect(rotationActivatedElement).toExist();
  });
});

import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect } from "detox";

describe("test fling gesture", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id("nav-fling")).tap();
  });

  const wrongElement = element(by.id("wrong-element"));
  const flingElement = element(by.id("fling-idle"));
  const flingActivatedElement = element(by.id("fling-activated"));
  const resetButton = element(by.id("reset"));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it("shouldn`t register a fling gesture on tap", async () => {
    await expect(flingElement).toExist();
    await flingElement.tap();
    await expect(flingActivatedElement).not.toExist();
  });

  it("shouldn`t register a fling gesture on different element", async () => {
    await expect(wrongElement).toExist();
    await wrongElement.swipe("right", "fast");
    await expect(flingActivatedElement).not.toExist();
  });

  it("should register a fling gesture", async () => {
    await expect(flingElement).toExist();
    await flingElement.swipe("right", "fast");
    await expect(flingActivatedElement).toExist();
  });

  it("multiple taps shouldn`t register a fling gesture", async () => {
    await expect(flingElement).toExist();
    await flingElement.multiTap(3);
    await expect(flingActivatedElement).not.toExist();
  });

  it("shouldnt change state due to multiple flings", async () => {
    await expect(flingElement).toExist();
    await flingElement.swipe("right", "fast");
    await flingActivatedElement.swipe("right", "fast");
    await expect(flingActivatedElement).toExist();
  });
});

import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect } from "detox";

describe("test pan gesture", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id("nav-pan")).tap();
  });

  const wrongElement = element(by.id("wrong-element"));
  const panActivatedElement = element(by.id("pan-activated"));
  const panElement = element(by.id("pan-idle"));
  const resetButton = element(by.id("reset"));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it("shouldn`t register a pan gesture on tap", async () => {
    await expect(panElement).toExist();
    await panElement.tap();
    await expect(panActivatedElement).not.toExist();
  });

  it("shouldn`t register a pan gesture on different element", async () => {
    await expect(wrongElement).toExist();
    await wrongElement.swipe("right", "fast");
    await expect(panActivatedElement).not.toExist();
  });

  it("should register a pan gesture", async () => {
    await expect(panElement).toExist();
    await panElement.swipe("right", "fast");
    await expect(panActivatedElement).toExist();
  });

  it("multiple touches shouldn`t register a pan gesture", async () => {
    await expect(panElement).toExist();
    await panElement.multiTap(3);
    await expect(panActivatedElement).not.toExist();
  });

  it("shouldnt change state due to multiple pans", async () => {
    await expect(panElement).toExist();
    await panElement.swipe("right", "fast");
    await panActivatedElement.swipe("left", "fast");
    await expect(panActivatedElement).toExist();
  });
});

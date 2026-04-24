import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { by, device, element, expect } from "detox";

describe("test hover gesture", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id("nav-hover")).tap();
  });

  const wrongElement = element(by.id("wrong-element"));
  const hoverElement = element(by.id("hover-idle"));
  const hoverActivatedElement = element(by.id("hover-activated"));
  const resetButton = element(by.id("reset"));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it("shouldn`t register a hover gesture on tap", async () => {
    await expect(hoverElement).toExist();
    await hoverElement.tap();
    await expect(hoverActivatedElement).not.toExist();
  });

  it("shouldn`t register a hover gesture on different element", async () => {
    await expect(wrongElement).toExist();
    await wrongElement.tap();
    await expect(hoverActivatedElement).not.toExist();
  });

  it.skip("should register a hover gesture", async () => {
    await expect(hoverElement).toExist();
    await expect(hoverActivatedElement).toExist();
  });

  it("multiple taps shouldn`t register a hover gesture", async () => {
    await expect(hoverElement).toExist();
    await hoverElement.multiTap(3);
    await expect(hoverActivatedElement).not.toExist();
  });
});

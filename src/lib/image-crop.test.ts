import { describe, expect, it } from "vitest";
import { computeCropDraw } from "@/components/ui/image-crop-modal";

// A 256x256 avatar frame saved at 640x640.
const AVATAR_FRAME = { frameWidth: 256, frameHeight: 256, outputWidth: 640 };

describe("crop geometry", () => {
  it("fills the frame exactly at zoom 1 for a square photo", () => {
    const r = computeCropDraw({
      naturalWidth: 4000,
      naturalHeight: 4000,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    // The whole 640px output must be covered, with no runaway magnification.
    expect(r.drawWidth).toBeCloseTo(640, 5);
    expect(r.drawHeight).toBeCloseTo(640, 5);
  });

  it("covers the frame for a wide photo without cropping vertically", () => {
    const r = computeCropDraw({
      naturalWidth: 4000,
      naturalHeight: 2000,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    // Short edge fits the frame; long edge overflows — that is `object-cover`.
    expect(r.drawHeight).toBeCloseTo(640, 5);
    expect(r.drawWidth).toBeCloseTo(1280, 5);
  });

  it("covers the frame for a tall photo", () => {
    const r = computeCropDraw({
      naturalWidth: 1000,
      naturalHeight: 3000,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    expect(r.drawWidth).toBeCloseTo(640, 5);
    expect(r.drawHeight).toBeCloseTo(1920, 5);
  });

  it("does not depend on the source resolution at zoom 1", () => {
    const small = computeCropDraw({
      naturalWidth: 400,
      naturalHeight: 400,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
    const huge = computeCropDraw({
      naturalWidth: 6000,
      naturalHeight: 6000,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    // The old bug: a 6000px photo was drawn ~15x larger than a 400px one.
    expect(huge.drawWidth).toBeCloseTo(small.drawWidth, 5);
  });

  it("scales linearly with zoom", () => {
    const base = computeCropDraw({
      naturalWidth: 2000,
      naturalHeight: 2000,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
    const zoomed = computeCropDraw({
      naturalWidth: 2000,
      naturalHeight: 2000,
      ...AVATAR_FRAME,
      zoom: 2,
      offsetX: 0,
      offsetY: 0,
    });

    expect(zoomed.drawWidth).toBeCloseTo(base.drawWidth * 2, 5);
  });

  it("converts drag offsets from preview space into output space", () => {
    const r = computeCropDraw({
      naturalWidth: 2000,
      naturalHeight: 2000,
      ...AVATAR_FRAME,
      zoom: 1,
      offsetX: 32,
      offsetY: -16,
    });

    // 640 / 256 = 2.5x
    expect(r.translateX).toBeCloseTo(80, 5);
    expect(r.translateY).toBeCloseTo(-40, 5);
  });

  it("covers a 3:1 banner frame", () => {
    const r = computeCropDraw({
      naturalWidth: 4000,
      naturalHeight: 3000,
      frameWidth: 600,
      frameHeight: 200,
      outputWidth: 1500,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    expect(r.drawWidth).toBeGreaterThanOrEqual(1500);
    expect(r.drawHeight).toBeGreaterThanOrEqual(500);
  });
});

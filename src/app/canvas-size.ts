import type { WindowContext } from "../types/design-core/core-api";

const MIN_CANVAS_SIZE = 1;

const getCanvasCssSize = (
  canvas: HTMLCanvasElement,
): Pick<WindowContext, "width" | "height"> => {
  const rect = canvas.getBoundingClientRect();

  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
};

export const syncCanvasSize = (
  canvas: HTMLCanvasElement,
): WindowContext | null => {
  const { width, height } = getCanvasCssSize(canvas);

  if (width < MIN_CANVAS_SIZE || height < MIN_CANVAS_SIZE) {
    return null;
  }

  const dpr = window.devicePixelRatio || MIN_CANVAS_SIZE;
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  if (canvas.width !== pixelWidth) {
    canvas.width = pixelWidth;
  }

  if (canvas.height !== pixelHeight) {
    canvas.height = pixelHeight;
  }

  return {
    width,
    height,
    pixelWidth: canvas.width,
    pixelHeight: canvas.height,
    dpr,
  };
};

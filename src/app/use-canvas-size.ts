import { useEffect } from "react";

import type { DesignApp } from "../core/app";

import { syncCanvasSize } from "./canvas-size";

const getContextKey = (width: number, height: number, dpr: number): string =>
  `${width}:${height}:${dpr}`;

export const useCanvasSize = (app: DesignApp | null): void => {
  useEffect(() => {
    if (!app) {
      return;
    }

    const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
    if (!canvas) {
      return;
    }

    let lastContextKey = "";
    const coreWindow = app.core.window();

    const updateCanvasSize = (): void => {
      const context = syncCanvasSize(canvas);
      if (!context) {
        return;
      }

      const contextKey = getContextKey(
        context.width,
        context.height,
        context.dpr,
      );

      if (contextKey === lastContextKey) {
        return;
      }

      lastContextKey = contextKey;
      coreWindow.setContext(context);
      app.core.draw();
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [app]);
};

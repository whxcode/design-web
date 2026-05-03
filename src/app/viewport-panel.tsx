import { useEffect, useState } from "react";
import { MoveHorizontal, MoveVertical, Scaling } from "lucide-react";

import { useApp } from ".";
import type { ViewportData } from "../types/design-core/core-api";

const emptyViewport: ViewportData = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export const ViewportPanel = () => {
  const { core, loaded } = useApp();
  const [viewport, setViewport] = useState<ViewportData>(emptyViewport);

  useEffect(() => {
    if (!loaded || !core) {
      return;
    }

    const update = () => {
      setViewport(core.viewport());
    };

    update();
    const timer = window.setInterval(update, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, [core, loaded]);

  return (
    <aside className="viewport-panel" aria-label="Viewport status">
      <span className="viewport-panel__group">
        <span className="viewport-panel__icon" aria-hidden="true">
          <MoveHorizontal size={14} strokeWidth={2} />
        </span>
        <span className="viewport-panel__value">
          {viewport.offsetX.toFixed(0)}
        </span>
      </span>
      <span className="viewport-panel__divider" />
      <span className="viewport-panel__group">
        <span className="viewport-panel__icon" aria-hidden="true">
          <MoveVertical size={14} strokeWidth={2} />
        </span>
        <span className="viewport-panel__value">
          {viewport.offsetY.toFixed(0)}
        </span>
      </span>
      <span className="viewport-panel__divider" />
      <span className="viewport-panel__group">
        <span className="viewport-panel__icon" aria-hidden="true">
          <Scaling size={14} strokeWidth={2} />
        </span>
        <span className="viewport-panel__value">
          {(viewport.scale * 100).toFixed(0)}%
        </span>
      </span>
    </aside>
  );
};

import { useEffect, useState } from "react";
import { MoveHorizontal, MoveVertical, Scaling } from "lucide-react";

import { useApp } from "./app-context";
import {
  ZAppEventType,
  type ViewportData,
} from "z-design";

export const ViewportPanel = () => {
  const app = useApp();
  const { core } = app;
  const [viewport, setViewport] = useState<ViewportData>(() => core.viewport());

  useEffect(() => {
    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.ViewportChanged, () => {
      setViewport(core.viewport());
    });

    return () => {
      appEvent.off(ZAppEventType.ViewportChanged, id);
    };
  }, [core]);

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

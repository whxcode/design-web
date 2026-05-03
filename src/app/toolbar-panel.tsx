import { useEffect, useState } from "react";
import { MousePointer2, Square } from "lucide-react";

import { useApp } from ".";
import { ZHandlerType } from "../types/design-core/core-api";

const readHandler = (getValue: () => number | undefined): ZHandlerType => {
  const value = getValue();
  if (value === ZHandlerType.DrawLayer) {
    return ZHandlerType.DrawLayer;
  }

  return ZHandlerType.Common;
};

export const ToolbarPanel = () => {
  const { core, loaded } = useApp();
  const [handler, setHandler] = useState<ZHandlerType>(ZHandlerType.Common);

  useEffect(() => {
    if (!loaded || !core) {
      return;
    }

    const update = () => {
      setHandler(readHandler(() => core.handler()));
    };

    update();
    const timer = window.setInterval(update, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, [core, loaded]);

  const switchHandler = (type: ZHandlerType) => {
    if (!core) {
      return;
    }

    core.switchHandler(type);
    setHandler(type);
  };

  return (
    <div className="toolbar-panel" aria-label="Editor tools">
      <button
        type="button"
        className={
          handler === ZHandlerType.Common
            ? "toolbar-panel__button is-active"
            : "toolbar-panel__button"
        }
        aria-label="Select tool"
        title="Select tool"
        onClick={() => switchHandler(ZHandlerType.Common)}
      >
        <MousePointer2 size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className={
          handler === ZHandlerType.DrawLayer
            ? "toolbar-panel__button is-active"
            : "toolbar-panel__button"
        }
        aria-label="Rectangle tool"
        title="Rectangle tool"
        onClick={() => switchHandler(ZHandlerType.DrawLayer)}
      >
        <Square size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

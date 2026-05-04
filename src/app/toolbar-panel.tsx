import { useEffect, useState } from "react";
import { Dices, MousePointer2, Redo2, Square, Undo2 } from "lucide-react";

import { useApp } from ".";
import {
  ZAppEventType,
  ZHandlerType,
} from "../types/design-core/core-api";

export const ToolbarPanel = () => {
  const { core, loaded } = useApp();
  const [handler, setHandler] = useState<ZHandlerType>(ZHandlerType.Common);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!loaded || !core) {
      return;
    }

    setHandler(core.handler());
    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.HandlerChanged, () => {
      setHandler(core.handler());
    });

    return () => {
      appEvent.off(ZAppEventType.HandlerChanged, id);
    };
  }, [core, loaded]);

  useEffect(() => {
    if (!loaded || !core) {
      return;
    }

    const updateHistoryState = () => {
      setCanUndo(core.canUndo());
      setCanRedo(core.canRedo());
    };

    updateHistoryState();
    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.HistoryChanged, updateHistoryState);

    return () => {
      appEvent.off(ZAppEventType.HistoryChanged, id);
    };
  }, [core, loaded]);

  const switchHandler = (type: ZHandlerType) => {
    if (!core) {
      return;
    }

    core.switchHandler(type);
  };

  const randProps = () => {
    if (!core) {
      return;
    }

    core.randProps();
  };

  const undo = () => {
    if (!core || !canUndo) {
      return;
    }

    core.undo();
  };

  const redo = () => {
    if (!core || !canRedo) {
      return;
    }

    core.redo();
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
      <button
        type="button"
        className="toolbar-panel__button"
        aria-label="Random transform"
        title="Random transform"
        onClick={randProps}
      >
        <Dices size={16} strokeWidth={2} />
      </button>
      <span className="toolbar-panel__divider" aria-hidden="true" />
      <button
        type="button"
        className="toolbar-panel__button"
        aria-label="Undo"
        title="Undo"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="toolbar-panel__button"
        aria-label="Redo"
        title="Redo"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

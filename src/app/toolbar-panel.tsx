import { useEffect, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { MousePointer2, Redo2, Square, Undo2 } from "lucide-react";

import { useApp } from ".";
import { ZAppEventType, ZHandlerType } from "../types/design-core/core-api";

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
      const commit = core.commit();
      setCanUndo(commit.canUndo());
      setCanRedo(commit.canRedo());
    };

    updateHistoryState();
    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.HistoryChanged, updateHistoryState);

    return () => {
      appEvent.off(ZAppEventType.HistoryChanged, id);
    };
  }, [core, loaded]);

  useEffect(() => {
    if (!core) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isUndo =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
      const isRedo = isUndo && event.shiftKey;

      if (!isUndo) {
        return;
      }

      event.preventDefault();

      if (isRedo) {
        if (core.commit().canRedo()) {
          core.commit().redo();
        }
        return;
      }

      if (core.commit().canUndo()) {
        core.commit().undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [core]);

  const switchHandler = (type: ZHandlerType) => {
    if (!core) {
      return;
    }

    core.switchHandler(type);
  };

  const undo = () => {
    if (!core || !canUndo) {
      return;
    }

    core.commit().undo();
  };

  const redo = () => {
    if (!core || !canRedo) {
      return;
    }

    core.commit().redo();
  };

  return (
    <div className="toolbar-panel" aria-label="Editor tools">
      <Tooltip label="选择" position="top" withArrow>
        <ActionIcon
          aria-label="选择"
          className={
            handler === ZHandlerType.Common
              ? "floating-icon-button is-active"
              : "floating-icon-button"
          }
          size={30}
          variant="transparent"
          onClick={() => switchHandler(ZHandlerType.Common)}
        >
          <MousePointer2 size={16} strokeWidth={2} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="矩形" position="top" withArrow>
        <ActionIcon
          aria-label="矩形"
          className={
            handler === ZHandlerType.DrawLayer
              ? "floating-icon-button is-active"
              : "floating-icon-button"
          }
          size={30}
          variant="transparent"
          onClick={() => switchHandler(ZHandlerType.DrawLayer)}
        >
          <Square size={16} strokeWidth={2} />
        </ActionIcon>
      </Tooltip>
      <span className="toolbar-panel__divider" aria-hidden="true" />
      <Tooltip label="撤销 (Ctrl+Z)" position="top" withArrow>
        <ActionIcon
          aria-label="撤销"
          className="floating-icon-button"
          disabled={!canUndo}
          size={30}
          variant="transparent"
          onClick={undo}
        >
          <Undo2 size={16} strokeWidth={2} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="重做 (Ctrl+Shift+Z)" position="top" withArrow>
        <ActionIcon
          aria-label="重做"
          className="floating-icon-button"
          disabled={!canRedo}
          size={30}
          variant="transparent"
          onClick={redo}
        >
          <Redo2 size={16} strokeWidth={2} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

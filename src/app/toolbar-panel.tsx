import { useEffect, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { MousePointer2, Redo2, Square, Undo2 } from "lucide-react";

import { useApp } from "./app-context";
import { ZAppEventType, ZHandlerType } from "../types/design-core/core-api";

export const ToolbarPanel = () => {
  const app = useApp();
  const { command, core } = app;
  const [handler, setHandler] = useState<ZHandlerType>(() => core.handler());
  const [canUndo, setCanUndo] = useState(() => command.canUndo());
  const [canRedo, setCanRedo] = useState(() => command.canRedo());

  useEffect(() => {
    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.HandlerChanged, () => {
      setHandler(core.handler());
    });

    return () => {
      appEvent.off(ZAppEventType.HandlerChanged, id);
    };
  }, [core]);

  useEffect(() => {
    const updateHistoryState = () => {
      setCanUndo(command.canUndo());
      setCanRedo(command.canRedo());
    };

    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.HistoryChanged, updateHistoryState);

    return () => {
      appEvent.off(ZAppEventType.HistoryChanged, id);
    };
  }, [command, core]);

  const undo = () => {
    if (!canUndo) {
      return;
    }

    command.undo();
  };

  const redo = () => {
    if (!canRedo) {
      return;
    }

    command.redo();
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
          onClick={() => command.switchToCommonHandler()}
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
          onClick={() => command.drawRectangle()}
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

import { useEffect, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { Circle, MousePointer2, PenLine, Redo2, Square, Undo2 } from "lucide-react";

import { useApp } from "./app-context";
import { ZAppEventType, ZEditorModeType } from "z-design";

const getToolButtonClass = (active: boolean) => {
  return active ? "floating-icon-button is-active" : "floating-icon-button";
};

export const ToolbarPanel = () => {
  const app = useApp();
  const { command, core } = app;
  const [editorMode, setEditorMode] = useState<ZEditorModeType>(() => core.editorMode());
  const [canUndo, setCanUndo] = useState(() => command.canUndo());
  const [canRedo, setCanRedo] = useState(() => command.canRedo());

  useEffect(() => {
    const appEvent = core.appEvent();
    const id = appEvent.on(ZAppEventType.EditorModeChanged, () => {
      setEditorMode(core.editorMode());
    });

    return () => {
      appEvent.off(ZAppEventType.EditorModeChanged, id);
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
          className={getToolButtonClass(editorMode === ZEditorModeType.Cursor)}
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
          className={getToolButtonClass(editorMode === ZEditorModeType.DrawRectangle)}
          size={30}
          variant="transparent"
          onClick={() => command.drawRectangle()}
        >
          <Square size={16} strokeWidth={2} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="椭圆" position="top" withArrow>
        <ActionIcon
          aria-label="椭圆"
          className={getToolButtonClass(editorMode === ZEditorModeType.DrawOval)}
          size={30}
          variant="transparent"
          onClick={() => command.drawEllipse()}
        >
          <Circle size={16} strokeWidth={2} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="向量" position="top" withArrow>
        <ActionIcon
          aria-label="向量"
          className={getToolButtonClass(editorMode === ZEditorModeType.DrawVector)}
          size={30}
          variant="transparent"
          onClick={() => command.drawVector()}
        >
          <PenLine size={16} strokeWidth={2} />
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

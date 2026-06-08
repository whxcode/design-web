import { type CoreCommand, ZCommandType } from "../types/design-core/core-api";

const WEB_COMMAND_START = 10000;

export const DesignCommandType = {
  Escape: ZCommandType.Escape,
  SwitchToCommonHandler: ZCommandType.SwitchToCommonHandler,
  DrawRectangle: ZCommandType.DrawRectangle,
  DrawEllipse: ZCommandType.DrawEllipse,
  DrawVector: ZCommandType.DrawVector,
  UndoDocumentHistory: ZCommandType.UndoDocumentHistory,
  RedoDocumentHistory: ZCommandType.RedoDocumentHistory,
  DeleteSelectedLayer: ZCommandType.DeleteSelectedLayer,
  CancelCurrentInteraction: ZCommandType.CancelCurrentInteraction,
  DownloadFile: ZCommandType.DownloadFile,
  OpenShortcutHelp: WEB_COMMAND_START,
} as const;

export type DesignCommandType =
  (typeof DesignCommandType)[keyof typeof DesignCommandType];
export type DesignCommandHandler = () => void;

const CORE_COMMAND_TYPES = new Set<DesignCommandType>(
  Object.values(ZCommandType).filter(
    (type): type is ZCommandType => typeof type === "number",
  ),
);

const toCoreCommandType = (type: DesignCommandType): ZCommandType | null => {
  if (!CORE_COMMAND_TYPES.has(type)) {
    return null;
  }

  return type as ZCommandType;
};

export class DesignCommand {
  private readonly _commandHandlers = new Map<
    DesignCommandType,
    DesignCommandHandler
  >();

  constructor(private readonly command: CoreCommand) {}

  registerCommand(
    type: DesignCommandType,
    handler: DesignCommandHandler,
  ): void {
    this._commandHandlers.set(type, handler);
  }

  canExecute(type: DesignCommandType): boolean {
    const coreCommandType = toCoreCommandType(type);
    if (coreCommandType !== null) {
      return this.command.canExecute(coreCommandType);
    }

    return this._commandHandlers.has(type);
  }

  execute(type: DesignCommandType): void {
    const coreCommandType = toCoreCommandType(type);
    if (coreCommandType !== null) {
      this.command.execute(coreCommandType);
      return;
    }

    this._commandHandlers.get(type)?.();
  }

  canSwitchToCommonHandler() {
    return this.command.canExecute(ZCommandType.SwitchToCommonHandler);
  }

  switchToCommonHandler() {
    this.command.execute(ZCommandType.SwitchToCommonHandler);
  }

  canDrawRectangle() {
    return this.command.canExecute(ZCommandType.DrawRectangle);
  }

  drawRectangle() {
    this.command.execute(ZCommandType.DrawRectangle);
  }

  canDrawEllipse() {
    return this.command.canExecute(ZCommandType.DrawEllipse);
  }

  drawEllipse() {
    this.command.execute(ZCommandType.DrawEllipse);
  }

  canDrawVector() {
    return this.command.canExecute(ZCommandType.DrawVector);
  }

  drawVector() {
    this.command.execute(ZCommandType.DrawVector);
  }

  canUndo() {
    return this.command.canExecute(ZCommandType.UndoDocumentHistory);
  }

  undo() {
    this.command.execute(ZCommandType.UndoDocumentHistory);
  }

  canRedo() {
    return this.command.canExecute(ZCommandType.RedoDocumentHistory);
  }

  redo() {
    this.command.execute(ZCommandType.RedoDocumentHistory);
  }

  canDeleteSelectedLayer() {
    return this.command.canExecute(ZCommandType.DeleteSelectedLayer);
  }

  deleteSelectedLayer() {
    this.command.execute(ZCommandType.DeleteSelectedLayer);
  }

  canCancelCurrentInteraction() {
    return this.command.canExecute(ZCommandType.CancelCurrentInteraction);
  }

  cancelCurrentInteraction() {
    this.command.execute(ZCommandType.CancelCurrentInteraction);
  }
}

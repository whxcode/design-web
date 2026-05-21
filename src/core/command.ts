import {
  type CoreCommand,
  ZCommandType,
} from "../types/design-core/core-api";

export class DesignCommand {
  constructor(private readonly command: CoreCommand) {}

  canExecute(type: ZCommandType) {
    return this.command.canExecute(type);
  }

  execute(type: ZCommandType) {
    this.command.execute(type);
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

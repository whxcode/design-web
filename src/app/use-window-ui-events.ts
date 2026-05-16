import { useEffect } from "react";

import {
  KeyCode,
  MouseButton,
  ZUIEventType,
} from "../types/design-core/core-api";
import { matchShortcut } from "../core/shortcuts";
import type { DesignApp } from "../core/app";
import type { ZUIEvent } from "../types/design-core/core-api";

const getCanvasPoint = (event: MouseEvent, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const getModifierState = (
  event: MouseEvent | WheelEvent | KeyboardEvent,
): Pick<ZUIEvent, "metaKey" | "ctrlKey" | "altKey" | "shiftKey"> => ({
  metaKey: event.metaKey,
  ctrlKey: event.ctrlKey,
  altKey: event.altKey,
  shiftKey: event.shiftKey,
});

const keyCodeMap: Record<string, KeyCode> = {
  KeyA: KeyCode.A,
  KeyB: KeyCode.B,
  KeyC: KeyCode.C,
  KeyD: KeyCode.D,
  KeyE: KeyCode.E,
  KeyF: KeyCode.F,
  KeyG: KeyCode.G,
  KeyH: KeyCode.H,
  KeyI: KeyCode.I,
  KeyJ: KeyCode.J,
  KeyK: KeyCode.K,
  KeyL: KeyCode.L,
  KeyM: KeyCode.M,
  KeyN: KeyCode.N,
  KeyO: KeyCode.O,
  KeyP: KeyCode.P,
  KeyQ: KeyCode.Q,
  KeyR: KeyCode.R,
  KeyS: KeyCode.S,
  KeyT: KeyCode.T,
  KeyU: KeyCode.U,
  KeyV: KeyCode.V,
  KeyW: KeyCode.W,
  KeyX: KeyCode.X,
  KeyY: KeyCode.Y,
  KeyZ: KeyCode.Z,
  Digit0: KeyCode.Digit0,
  Digit1: KeyCode.Digit1,
  Digit2: KeyCode.Digit2,
  Digit3: KeyCode.Digit3,
  Digit4: KeyCode.Digit4,
  Digit5: KeyCode.Digit5,
  Digit6: KeyCode.Digit6,
  Digit7: KeyCode.Digit7,
  Digit8: KeyCode.Digit8,
  Digit9: KeyCode.Digit9,
  Escape: KeyCode.Escape,
  Enter: KeyCode.Enter,
  Space: KeyCode.Space,
  Backspace: KeyCode.Backspace,
  Tab: KeyCode.Tab,
  ShiftLeft: KeyCode.Shift,
  ShiftRight: KeyCode.Shift,
  ControlLeft: KeyCode.Control,
  ControlRight: KeyCode.Control,
  AltLeft: KeyCode.Alt,
  AltRight: KeyCode.Alt,
  MetaLeft: KeyCode.Meta,
  MetaRight: KeyCode.Meta,
  ArrowLeft: KeyCode.ArrowLeft,
  ArrowRight: KeyCode.ArrowRight,
  ArrowUp: KeyCode.ArrowUp,
  ArrowDown: KeyCode.ArrowDown,
  Delete: KeyCode.Delete,
};

const getKeyCode = (event: KeyboardEvent) =>
  keyCodeMap[event.code] ?? KeyCode.Unknown;

const mouseButtonMap: Record<number, MouseButton> = {
  0: MouseButton.Left,
  1: MouseButton.Middle,
  2: MouseButton.Right,
};

const getMouseButton = (event: MouseEvent) =>
  mouseButtonMap[event.button] ?? MouseButton.Unknown;

export const useWindowUIEvents = (app: DesignApp | null) => {
  useEffect(() => {
    if (!app) {
      return;
    }

    const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
    if (!canvas) {
      return;
    }

    const { core, command } = app;
    const wheelOptions: AddEventListenerOptions = { passive: false };

    const emitMouseEvent = (type: ZUIEventType, event: MouseEvent) => {
      const point = getCanvasPoint(event, canvas);

      core.onUIEvent({
        type,
        x: point.x,
        y: point.y,
        deltaX: 0,
        deltaY: 0,
        keyCode: KeyCode.Unknown,
        button: getMouseButton(event),
        ...getModifierState(event),
      });
    };

    const emitWheelEvent = (event: WheelEvent) => {
      const point = getCanvasPoint(event, canvas);

      core.onUIEvent({
        type: ZUIEventType.MouseWheel,
        x: point.x,
        y: point.y,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        keyCode: KeyCode.Unknown,
        button: MouseButton.Unknown,
        ...getModifierState(event),
      });
    };

    const emitKeyEvent = (type: ZUIEventType, event: KeyboardEvent) => {
      core.onUIEvent({
        type,
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
        keyCode: getKeyCode(event),
        button: MouseButton.Unknown,
        ...getModifierState(event),
      });
    };

    const handleMouseDown = (event: MouseEvent) => {
      emitMouseEvent(ZUIEventType.MouseDown, event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      emitMouseEvent(ZUIEventType.MouseMove, event);
    };

    const handleMouseUp = (event: MouseEvent) => {
      emitMouseEvent(ZUIEventType.MouseUp, event);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      emitWheelEvent(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = matchShortcut(event);
      if (shortcut) {
        command.execute(shortcut.command);

        if (shortcut.preventCpp) {
          event.preventDefault();
          return;
        }
      }

      emitKeyEvent(ZUIEventType.KeyDown, event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const shortcut = matchShortcut(event);
      if (shortcut?.preventCpp) {
        event.preventDefault();
        return;
      }

      emitKeyEvent(ZUIEventType.KeyUp, event);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, wheelOptions);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel, wheelOptions);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [app]);
};

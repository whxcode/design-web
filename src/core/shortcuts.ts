import { ZCommandType } from "../types/design-core/core-api";

export enum ShortcutCategory {
  Tool = "tool",
  Edit = "edit",
  History = "history",
  View = "view",
}

export interface ShortcutItem {
  command: ZCommandType;
  description: string;
  category: ShortcutCategory;
  preventCpp: boolean;
  keys: string[];
}

export const getShortcutCategoryLabel = (category: ShortcutCategory) => {
  switch (category) {
    case ShortcutCategory.Tool:
      return "工具";
    case ShortcutCategory.Edit:
      return "编辑";
    case ShortcutCategory.History:
      return "历史";
    case ShortcutCategory.View:
      return "视图";
  }
};

export const shortcuts: ShortcutItem[] = [
  {
    command: ZCommandType.DrawRectangle,
    description: "绘制矩形",
    category: ShortcutCategory.Tool,
    preventCpp: true,
    keys: ["R"],
  },
  {
    command: ZCommandType.DeleteSelectedLayer,
    description: "删除选中的图层",
    category: ShortcutCategory.Edit,
    preventCpp: true,
    keys: ["Delete", "Backspace"],
  },
  {
    command: ZCommandType.UndoDocumentHistory,
    description: "撤销",
    category: ShortcutCategory.History,
    preventCpp: true,
    keys: ["Ctrl+Z", "Meta+Z"],
  },
  {
    command: ZCommandType.RedoDocumentHistory,
    description: "重做",
    category: ShortcutCategory.History,
    preventCpp: true,
    keys: ["Ctrl+Shift+Z", "Meta+Shift+Z"],
  },
];

const normalizeKey = (event: KeyboardEvent) => {
  const parts: string[] = [];
  if (event.ctrlKey) {
    parts.push("Ctrl");
  }
  if (event.metaKey) {
    parts.push("Meta");
  }
  if (event.altKey) {
    parts.push("Alt");
  }
  if (event.shiftKey) {
    parts.push("Shift");
  }

  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  parts.push(key);
  return parts.join("+");
};

export const matchShortcut = (event: KeyboardEvent) => {
  const key = normalizeKey(event);
  return shortcuts.find((shortcut) => shortcut.keys.includes(key)) ?? null;
};

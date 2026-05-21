import { DesignCommandType } from "./command";

export enum ShortcutCategory {
  Tool = "tool",
  Edit = "edit",
  History = "history",
  View = "view",
}

export enum ShortcutTrigger {
  KeyDown = "keydown",
  KeyUp = "keyup",
}

export interface ShortcutItem {
  id: string;
  command: DesignCommandType;
  description: string;
  category: ShortcutCategory;
  trigger: ShortcutTrigger;
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
    id: "escape",
    command: DesignCommandType.Escape,
    description: "取消当前操作",
    category: ShortcutCategory.Tool,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["Escape"],
  },
  {
    id: "draw-rectangle",
    command: DesignCommandType.DrawRectangle,
    description: "绘制矩形",
    category: ShortcutCategory.Tool,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["R"],
  },
  {
    id: "draw-ellipse",
    command: DesignCommandType.DrawEllipse,
    description: "绘制椭圆",
    category: ShortcutCategory.Tool,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["O"],
  },
  {
    id: "draw-vector",
    command: DesignCommandType.DrawVector,
    description: "绘制向量",
    category: ShortcutCategory.Tool,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["P"],
  },
  {
    id: "delete-selected-layer",
    command: DesignCommandType.DeleteSelectedLayer,
    description: "删除选中的图层",
    category: ShortcutCategory.Edit,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["Delete", "Backspace"],
  },
  {
    id: "undo-document-history",
    command: DesignCommandType.UndoDocumentHistory,
    description: "撤销",
    category: ShortcutCategory.History,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["Ctrl+Z", "Meta+Z"],
  },
  {
    id: "redo-document-history",
    command: DesignCommandType.RedoDocumentHistory,
    description: "重做",
    category: ShortcutCategory.History,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["Ctrl+Shift+Z", "Meta+Shift+Z"],
  },
  {
    id: "open-shortcut-help",
    command: DesignCommandType.OpenShortcutHelp,
    description: "打开快捷键面板",
    category: ShortcutCategory.View,
    trigger: ShortcutTrigger.KeyDown,
    preventCpp: true,
    keys: ["?"],
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

  if (event.shiftKey && event.key !== "?") {
    parts.push("Shift");
  }

  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  parts.push(key);
  return parts.join("+");
};

const createShortcutMap = (trigger: ShortcutTrigger) => {
  const shortcutMap = new Map<string, ShortcutItem>();
  shortcuts.forEach((shortcut) => {
    if (shortcut.trigger !== trigger) {
      return;
    }

    shortcut.keys.forEach((key) => {
      shortcutMap.set(key, shortcut);
    });
  });

  return shortcutMap;
};

const SHORTCUT_MAP = {
  [ShortcutTrigger.KeyDown]: createShortcutMap(ShortcutTrigger.KeyDown),
  [ShortcutTrigger.KeyUp]: createShortcutMap(ShortcutTrigger.KeyUp),
};

const PREVENT_CPP_KEYS = new Set<string>();
shortcuts.forEach((shortcut) => {
  if (!shortcut.preventCpp) {
    return;
  }

  shortcut.keys.forEach((key) => {
    PREVENT_CPP_KEYS.add(key);
  });
});

export const matchShortcut = (
  event: KeyboardEvent,
  trigger: ShortcutTrigger,
) => {
  const key = normalizeKey(event);
  return SHORTCUT_MAP[trigger].get(key) ?? null;
};

export const shouldPreventCppShortcut = (event: KeyboardEvent) => {
  const key = normalizeKey(event);
  return PREVENT_CPP_KEYS.has(key);
};

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { HelpCircle, X } from "lucide-react";

import { useShortcutHelp } from "./app-context";
import { getShortcutCategoryLabel, ShortcutCategory, shortcuts } from "../core/shortcuts";

const SHORTCUT_CATEGORIES = [
  ShortcutCategory.Tool,
  ShortcutCategory.Edit,
  ShortcutCategory.History,
  ShortcutCategory.View,
];

export const ShortcutHelpPanel = () => {
  const [activeCategory, setActiveCategory] = useState(ShortcutCategory.Tool);
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    shortcutHelpOpened,
    closeShortcutHelp,
    toggleShortcutHelp,
  } = useShortcutHelp();
  const activeShortcuts = useMemo(() => {
    return shortcuts.filter((shortcut) => shortcut.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (!shortcutHelpOpened) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      closeShortcutHelp();
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeShortcutHelp, shortcutHelpOpened]);

  return (
    <div className={shortcutHelpOpened ? "shortcut-help is-open" : "shortcut-help"} ref={rootRef}>
      {shortcutHelpOpened ? (
        <section className="shortcut-help__panel" aria-label="快捷键说明">
          <header className="shortcut-help__tabs">
            <nav className="shortcut-help__tab-list" aria-label="快捷键分类">
              {SHORTCUT_CATEGORIES.map((category) => (
                <button
                  className={category === activeCategory ? "shortcut-help__tab is-active" : "shortcut-help__tab"}
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                >
                  {getShortcutCategoryLabel(category)}
                </button>
              ))}
            </nav>
            <Tooltip label="关闭" position="left" withArrow>
              <ActionIcon
                aria-label="关闭快捷键说明"
                className="shortcut-help__close"
                size={30}
                variant="transparent"
                onClick={closeShortcutHelp}
              >
                <X size={16} strokeWidth={2} />
              </ActionIcon>
            </Tooltip>
          </header>
          <div className="shortcut-help__content">
            <div className="shortcut-help__grid">
              {activeShortcuts.map((shortcut) => (
                <div className="shortcut-help__item" key={shortcut.id}>
                  <span className="shortcut-help__keys">
                    {shortcut.keys.map((key) => (
                      <kbd className="shortcut-help__key" key={key}>
                        {key}
                      </kbd>
                    ))}
                  </span>
                  <span className="shortcut-help__description">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {!shortcutHelpOpened ? (
        <Tooltip label="快捷键" position="left" withArrow>
          <ActionIcon
            aria-label="快捷键说明"
            aria-expanded={shortcutHelpOpened}
            className="floating-icon-button"
            size={30}
            variant="transparent"
            onClick={toggleShortcutHelp}
          >
            <HelpCircle size={16} strokeWidth={2} />
          </ActionIcon>
        </Tooltip>
      ) : null}
    </div>
  );
};

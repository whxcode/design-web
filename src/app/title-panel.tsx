import { ActionIcon, Menu } from "@mantine/core";
import { Check, Menu as MenuIcon, Monitor, Moon, Sun } from "lucide-react";
import {
  type MantineColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useCallback, useEffect } from "react";
import type { ReactNode } from "react";

import { useApp } from "./index";
import { ZEditorThemeType } from "../types/design-core/core-api";

const themeOptions: Array<{
  icon: ReactNode;
  label: string;
  value: MantineColorScheme;
}> = [
  {
    icon: <Monitor size={14} strokeWidth={2} />,
    label: "跟随系统",
    value: "auto",
  },
  {
    icon: <Sun size={14} strokeWidth={2} />,
    label: "浅色",
    value: "light",
  },
  {
    icon: <Moon size={14} strokeWidth={2} />,
    label: "深色",
    value: "dark",
  },
];

export const TitlePanel = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { core, loaded } = useApp();

  const resolveCoreTheme = useCallback((scheme: MantineColorScheme) => {
    if (scheme === "dark") {
      return ZEditorThemeType.Dark;
    }

    if (scheme === "light") {
      return ZEditorThemeType.Light;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? ZEditorThemeType.Dark
      : ZEditorThemeType.Light;
  }, []);

  const handleThemeChange = (scheme: MantineColorScheme) => {
    setColorScheme(scheme);
    if (loaded && core) {
      core.setTheme(resolveCoreTheme(scheme));
    }
  };

  useEffect(() => {
    if (!loaded || !core) {
      return;
    }

    core.setTheme(resolveCoreTheme(colorScheme));

    if (colorScheme !== "auto") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      core.setTheme(resolveCoreTheme("auto"));
    };

    media.addEventListener("change", handleSystemThemeChange);
    return () => {
      media.removeEventListener("change", handleSystemThemeChange);
    };
  }, [colorScheme, core, loaded, resolveCoreTheme]);

  return (
    <header className="title-panel" aria-label="Document menu">
      <Menu position="bottom-start" shadow="md" width={154} withinPortal>
        <Menu.Target>
          <ActionIcon
            aria-label="Open document menu"
            className="floating-icon-button"
            size={30}
            variant="transparent"
          >
            <MenuIcon size={16} strokeWidth={2} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown className="floating-menu">
          {themeOptions.map((option) => (
            <Menu.Item
              key={option.value}
              leftSection={option.icon}
              rightSection={
                colorScheme === option.value ? (
                  <Check size={13} strokeWidth={2} />
                ) : null
              }
              onClick={() => handleThemeChange(option.value)}
            >
              {option.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      <span className="title-panel__divider" aria-hidden="true" />
      <span className="title-panel__name" title="Test Doc A">
        Test Doc A
      </span>
    </header>
  );
};

import { ActionIcon, Menu } from "@mantine/core";
import {
  Check,
  Download,
  Menu as MenuIcon,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import {
  type MantineColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import JSZip from "jszip";

import { useApp } from "./app-context";
import { ZEditorThemeType } from "../types/design-core/core-api";
import { decodeDocumentFile } from "../kiwi/decode";

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
  const app = useApp();
  const { core } = app;
  const [exporting, setExporting] = useState(false);

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
    core.setTheme(resolveCoreTheme(scheme));
  };

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const data = core.exportFile();

      // 🐛 调试：解码并打印导出数据
      const decoded: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        try {
          decoded[key] = decodeDocumentFile(value as Uint8Array);
        } catch (e) {
          decoded[key] = `${(value as Uint8Array).byteLength} bytes (decode失败: ${e})`;
        }
      }
      console.log("🐛 exportFile decoded:", decoded);

      const zip = new JSZip();

      for (const [key, value] of Object.entries(data)) {
        zip.file(key, value as Uint8Array);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.kiwi.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("导出失败:", err);
    } finally {
      setExporting(false);
    }
  }, [core, exporting]);

  useEffect(() => {
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
  }, [colorScheme, core, resolveCoreTheme]);

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
          <Menu.Divider />
          <Menu.Item
            leftSection={<Download size={14} strokeWidth={2} />}
            disabled={exporting}
            onClick={handleExport}
          >
            {exporting ? "导出中..." : "导出 kiwi"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <span className="title-panel__divider" aria-hidden="true" />
      <span className="title-panel__name" title="Test Doc A">
        Test Doc A
      </span>
    </header>
  );
};

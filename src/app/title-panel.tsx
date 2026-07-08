import { ActionIcon, Menu } from "@mantine/core";
import {
  Check,
  Download,
  Menu as MenuIcon,
  Monitor,
  Moon,
  Sun,
  Upload,
} from "lucide-react";
import { type MantineColorScheme, useMantineColorScheme } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import JSZip from "jszip";

import { useApp } from "./app-context";
import { ZEditorThemeType } from "z-design";

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

interface ExportedPageFile {
  id: string;
  document: Uint8Array;
}

export const TitlePanel = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const app = useApp();
  const { core } = app;
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const data = core.exportDocument();
      const documentBytes = data.document as Uint8Array | undefined;
      const pageFiles = (data.pages ?? []) as ExportedPageFile[];

      if (!documentBytes) {
        throw new Error("导出结果缺少 document 数据");
      }

      if (pageFiles.length === 0) {
        throw new Error("导出结果缺少 page 数据");
      }

      const zip = new JSZip();

      zip.file(
        "manifest.json",
        JSON.stringify(
          {
            name: data.name || "Untitled",
            version: 1,
          },
          null,
          2,
        ),
      );
      zip.file("document.kiwi", documentBytes);

      for (const page of pageFiles) {
        zip.file(`page-${page.id}.kiwi`, page.document);
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

  const loadDocument = useCallback(async () => {
    if (loading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".kiwi.zip,.zip,.kiwi,application/zip,application/octet-stream";
    input.style.display = "none";
    input.oncancel = () => {
      input.remove();
    };

    input.onchange = async () => {
      const file = input.files?.[0];
      input.remove();

      if (!file) {
        return;
      }

      setLoading(true);
      try {
        const fileBuffer = await file.arrayBuffer();
        let payload: Uint8Array | { document: Uint8Array; pages: Uint8Array[] };

        if (file.name.endsWith(".zip")) {
          const zip = await JSZip.loadAsync(fileBuffer);
          const documentEntry = zip.file("document.kiwi");

          if (documentEntry) {
            const pageEntries = Object.keys(zip.files)
              .filter((name) => /^page-.+\.kiwi$/.test(name))
              .sort()
              .map((name) => zip.file(name));

            if (pageEntries.length === 0) {
              throw new Error("zip 文件缺少 page 数据");
            }

            payload = {
              document: await documentEntry.async("uint8array"),
              pages: await Promise.all(
                pageEntries.map((entry) => {
                  if (!entry) {
                    throw new Error("zip 文件缺少 page 数据");
                  }

                  return entry.async("uint8array");
                }),
              ),
            };
          } else {
            const legacyEntry = zip.file("document");

            if (!legacyEntry) {
              throw new Error("zip 文件缺少 document.kiwi 数据");
            }

            payload = await legacyEntry.async("uint8array");
          }
        } else {
          payload = new Uint8Array(fileBuffer);
        }

        const result = core.loadDocument(payload);
        if (!result?.success) {
          throw new Error(result?.message ?? "文档加载失败");
        }
      } catch (err) {
        console.error("加载文档失败:", err);
      } finally {
        setLoading(false);
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [core, loading]);

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

          <Menu.Item
            leftSection={<Upload size={14} strokeWidth={2} />}
            disabled={loading}
            onClick={loadDocument}
          >
            {loading ? "加载中..." : "加载文档"}
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

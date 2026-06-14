import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AppContext, type IAppContext } from "./app-context";
import { syncCanvasSize } from "./canvas-size";
import { useCanvasSize } from "./use-canvas-size";
import { useWindowUIEvents } from "./use-window-ui-events";
import { DesignApp } from "../core/app";
import { DesignCommandType } from "../core/command";
import type {
  CoreModule,
  CreateCoreFactory,
  CreateCoreOptions,
} from "../types/design-core/core-api";

declare global {
  interface Window {
    createCore?: CreateCoreFactory;
    __addonkitPath?: string;
  }
}

let designCoreScriptPromise: Promise<void> | null = null;

const isElectronEnv = () =>
  typeof navigator !== "undefined" &&
  navigator.userAgent.includes("Electron");

const getCoreFactory = async (): Promise<CreateCoreFactory> => {
  // Electron/addon 路径：require addonkit.node，返回 createCore 工厂
  if (isElectronEnv()) {
    const addonkitPath = window.__addonkitPath;
    if (!addonkitPath) {
      throw new Error("Electron 环境下 __addonkitPath 未设置");
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const addonkit = require(addonkitPath) as {
      createCore: (options?: Record<string, unknown>) => unknown;
    };
    // 包装成 CreateCoreFactory（返回 Promise）
    return async (options: CreateCoreOptions): Promise<CoreModule> => {
      return addonkit.createCore(options as Record<string, unknown>) as CoreModule;
    };
  }

  // 浏览器/wasm 路径：如果已有 createCore 直接返回
  if (window.createCore) {
    return window.createCore;
  }

  // 否则动态加载 DesignCore.js
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-design-core="true"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("DesignCore.js load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/wasm/DesignCore.js";
    script.async = true;
    script.dataset.designCore = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("DesignCore.js load failed"));
    document.body.appendChild(script);
  }).catch((error) => {
    throw error;
  });

  const factory = window.createCore;
  if (!factory) throw new Error("DesignCore.js 加载后 createCore 不可用");
  return factory;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [module, setModule] = useState<CoreModule | null>(null);
  const [shortcutHelpOpened, setShortcutHelpOpened] = useState(false);
  const app = useMemo(() => (module ? new DesignApp(module) : null), [module]);

  const openShortcutHelp = useCallback(() => {
    setShortcutHelpOpened(true);
  }, []);

  const closeShortcutHelp = useCallback(() => {
    setShortcutHelpOpened(false);
  }, []);

  const toggleShortcutHelp = useCallback(() => {
    setShortcutHelpOpened((currentOpened) => !currentOpened);
  }, []);

  useWindowUIEvents(app);
  useCanvasSize(app);

  useEffect(() => {
    if (!app) {
      return;
    }

    app.command.registerCommand(
      DesignCommandType.OpenShortcutHelp,
      openShortcutHelp,
    );
  }, [app, openShortcutHelp]);

  useEffect(() => {
    let disposed = false;

    const initCore = async () => {
      try {
        const createCore = await getCoreFactory();
        if (disposed) return;

        const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
        if (!canvas) throw new Error("Canvas element not found");

        syncCanvasSize(canvas);

        const createCoreOptions: CreateCoreOptions = {
          canvas,
          locateFile: (path: string) => `/wasm/${path}`,
          noInitialRun: false,
          onRuntimeInitialized: () => {},
          print: (text: string) => { console.log(text); },
        };

        const coreModule = await createCore(createCoreOptions);
        if (disposed) return;

        setModule(coreModule);
        setLoaded(true);
      } catch (error) {
        console.error("Core init failed:", error);
      }
    };

    initCore();

    return () => {
      disposed = true;
    };
  }, []);

  const context = useMemo<IAppContext>(
    () => ({
      module,
      app,
      loaded,
      shortcutHelpOpened,
      openShortcutHelp,
      closeShortcutHelp,
      toggleShortcutHelp,
    }),
    [
      app,
      closeShortcutHelp,
      loaded,
      module,
      openShortcutHelp,
      shortcutHelpOpened,
      toggleShortcutHelp,
    ],
  );

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

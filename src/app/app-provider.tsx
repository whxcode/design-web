import React, { useCallback, useEffect, useMemo, useState } from "react";
import createDesignCore from "z-design";

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
} from "z-design";

declare global {
  interface Window {
    __addonkitPath?: string;
  }
}

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

  return createDesignCore as CreateCoreFactory;
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
          noInitialRun: false,
          onRuntimeInitialized: () => {},
          print: (text: string) => { console.log(text); },
        };

        const coreModule = await createCore(createCoreOptions);
        if (disposed) return;

        // Electron addon 环境：绑定 canvas 到渲染器
        if (isElectronEnv()) {
          try {
            const addonkitPath = window.__addonkitPath;
            if (addonkitPath) {
              const addon = require(addonkitPath) as { bindCanvas?: () => void };
              addon.bindCanvas?.();
            }
          } catch (e) {
            console.warn("bindCanvas failed:", e);
          }
        }

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

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AppContext, type IAppContext } from "./app-context";
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
  }
}

let designCoreScriptPromise: Promise<void> | null = null;

const ensureDesignCoreScript = () => {
  if (window.createCore) {
    return Promise.resolve();
  }

  if (designCoreScriptPromise) {
    return designCoreScriptPromise;
  }

  designCoreScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-design-core="true"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("DesignCore.js load failed")),
        { once: true },
      );
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
    designCoreScriptPromise = null;
    throw error;
  });

  return designCoreScriptPromise;
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

    const initWasm = async () => {
      try {
        await ensureDesignCoreScript();
        if (disposed) {
          return;
        }

        if (!window.createCore) {
          throw new Error("createCore is not available on window");
        }

        const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;

        if (!canvas) {
          throw new Error("Canvas element not found");
        }

        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;

        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";

        const createCoreOptions: CreateCoreOptions = {
          canvas,
          locateFile: (path: string) => `/wasm/${path}`,
          noInitialRun: false,
          onRuntimeInitialized: () => {},
          print: (text: string) => {
            console.log(text);
          },
        };

        const coreModule = await window.createCore(createCoreOptions);

        if (disposed) {
          return;
        }

        setModule(coreModule);
        setLoaded(true);
      } catch (error) {
        console.error("WASM init failed:", error);
      }
    };

    initWasm();

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

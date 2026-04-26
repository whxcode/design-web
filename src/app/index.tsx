import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useWindowUIEvents } from "./use-window-ui-events";
import type {
  CoreApp,
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

export interface IAppContext {
  app: CoreModule;
  core: CoreApp;
  loaded: boolean;
}
// 1. 定义 Context 类型
const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [appInstance, setAppInstance] = useState<CoreModule | null>(null);
  const core = useMemo(() => appInstance?.getApp() ?? null, [appInstance]);

  useWindowUIEvents(core);

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

          // 确保主线程不会在 Worker 还没准备好时就去尝试同步状态
          noInitialRun: false,

          onRuntimeInitialized: () => {
            // console.log("🚀 运行时已就绪");
          },
          // 增加 print 监控，看 main 是否真的跑到了
          print: (text: string) => {
            console.log(text);
          },
        };

        const app = await window.createCore(createCoreOptions);

        setAppInstance(app);

        if (disposed) {
          return;
        }
      } catch (error) {
        console.error("WASM init failed:", error);
      }
    };

    initWasm().then(() => {
      setLoaded(true);
    });

    return () => {
      disposed = true;
    };
  }, []);

  const context = useMemo<IAppContext>(
    () => ({ app: appInstance!, loaded, core: core! }),
    [appInstance, core, loaded],
  );

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

// 2. 导出你想要的 useApp 钩子
export const useApp = () => useContext(AppContext);

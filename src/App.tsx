import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    createCore?: (options: Record<string, unknown>) => Promise<any>;
  }
}

let designCoreScriptPromise: Promise<void> | null = null;

function ensureDesignCoreScript(): Promise<void> {
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
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [coreModule, setCoreModule] = useState<any>(null);

  useEffect(() => {
    let disposed = false;

    const initWasm = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      try {
        await ensureDesignCoreScript();
        if (disposed) {
          return;
        }

        if (!window.createCore) {
          throw new Error("createCore is not available on window");
        }

        const Module = await window.createCore({
          canvas,
          locateFile: (path: string) => `/wasm/${path}`,
          // Required for pthread workers to resolve the main loader script path.
          mainScriptUrlOrBlob: "/wasm/DesignCore.js",
          onRuntimeInitialized: () => {
            console.log("Engine runtime initialized");
          },
        });

        if (disposed) {
          return;
        }

        setCoreModule(Module);
        setIsLoaded(true);
      } catch (error) {
        console.error("WASM init failed:", error);
      }
    };

    initWasm();

    return () => {
      disposed = true;
    };
  }, []);

  const handleMove = () => {
    if (coreModule?.updatePosition) {
      coreModule.updatePosition(Math.random() * 500);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">
        M3 Core Engine (WASM + Pthreads)
      </h1>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          id="canvas"
          width={800}
          height={600}
          className="bg-black rounded-lg shadow-2xl border border-zinc-700 cursor-crosshair"
          onContextMenu={(e) => e.preventDefault()}
        />

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleMove}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
        >
          随机改变位置 React -- C++
        </button>
      </div>

      <footer className="mt-auto py-6 text-zinc-500 text-sm">
        Status: {isLoaded ? "✅ Engine Running" : "⏳ Initializing..."}
      </footer>
    </div>
  );
}

export default App;

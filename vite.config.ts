import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // 1. 导入插件

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // 2. 放在这里启动 v4 引擎
    react(),
  ],
  server: {
    headers: {
      // 必须有这两行，否则 SharedArrayBuffer 会报错，WASM 无法启动线程
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});

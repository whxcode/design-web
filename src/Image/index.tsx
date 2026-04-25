import { useEffect } from "react";
import { useApp } from "../app";

export const ImageTest = () => {
  const { app, core } = useApp();

  useEffect(() => {
    fetch("/tiger_i_cn.jpg")
      .then((res) => res.arrayBuffer())
      .then(async (data) => {
        const { width, height } = await createImageBitmap(new Blob([data]));
        const ptr = core.putImage(data.byteLength, width, height);
        const view = new Uint8Array(app.HEAPU8.buffer, ptr, data.byteLength);

        view.set(new Uint8Array(data));
        core.draw();
      });
  }, []);
  return null;
};

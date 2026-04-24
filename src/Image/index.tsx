import { useEffect } from "react";
import { useApp } from "../app";

export const ImageTest = () => {
  const { app, core } = useApp();

  useEffect(() => {
    fetch("/tiger_i_cn.jpg")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        core.putImage1(new Uint8Array(data)); // 方案一,js和c++会存在两个byte

        const ptr = core.calloc(data.byteLength); // 方案二，现在c++开辟对应大小的内存空间。
        console.log(app);

        console.log(new Uint8Array(data));
        const view = new Uint8Array(app.HEAPU8.buffer, ptr, data.byteLength);
        console.log(ptr, view);
      });
  }, []);
  return null;
};

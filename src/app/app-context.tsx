import { createContext, useContext } from "react";

import type { DesignApp } from "../core/app";
import type { CoreModule } from "../types/design-core/core-api";

export interface IAppContext {
  module: CoreModule | null;
  app: DesignApp | null;
  loaded: boolean;
}

export const AppContext = createContext<IAppContext>({
  module: null,
  app: null,
  loaded: false,
});

export const useApp = () => {
  const app = useContext(AppContext).app;
  if (!app) {
    throw new Error("DesignApp is not ready");
  }
  return app;
};

export const useAppStatus = () => {
  const { loaded, module } = useContext(AppContext);
  return { loaded, module };
};

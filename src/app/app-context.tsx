import { createContext, useContext } from "react";

import type { DesignApp } from "../core/app";
import type { CoreModule } from "z-design";

export interface IAppContext {
  module: CoreModule | null;
  app: DesignApp | null;
  loaded: boolean;
  shortcutHelpOpened: boolean;
  openShortcutHelp: () => void;
  closeShortcutHelp: () => void;
  toggleShortcutHelp: () => void;
}

export const AppContext = createContext<IAppContext>({
  module: null,
  app: null,
  loaded: false,
  shortcutHelpOpened: false,
  openShortcutHelp: () => {},
  closeShortcutHelp: () => {},
  toggleShortcutHelp: () => {},
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

export const useShortcutHelp = () => {
  const {
    shortcutHelpOpened,
    openShortcutHelp,
    closeShortcutHelp,
    toggleShortcutHelp,
  } = useContext(AppContext);

  return {
    shortcutHelpOpened,
    openShortcutHelp,
    closeShortcutHelp,
    toggleShortcutHelp,
  };
};

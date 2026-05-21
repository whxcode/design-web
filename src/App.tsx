import { AppProvider } from "./app/app-provider";
import { useAppStatus } from "./app/app-context";
import { ShortcutHelpPanel } from "./app/shortcut-help-panel";
import { TitlePanel } from "./app/title-panel";
import { ToolbarPanel } from "./app/toolbar-panel";
import { ViewportPanel } from "./app/viewport-panel";
import { Workspace } from "./workspace";

import "./App.css";

const AppPanels = () => {
  const { loaded } = useAppStatus();
  if (!loaded) {
    return null;
  }

  return (
    <>
      <ViewportPanel />
      <TitlePanel />
      <ToolbarPanel />
      <ShortcutHelpPanel />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <Workspace />
      <AppPanels />
    </AppProvider>
  );
}

export default App;

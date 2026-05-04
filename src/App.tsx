import { AppProvider, useApp } from "./app/index";
import { TitlePanel } from "./app/title-panel";
import { ToolbarPanel } from "./app/toolbar-panel";
import { ViewportPanel } from "./app/viewport-panel";
import { Workspace } from "./workspace";
import { ImageTest } from "./Image";

import "./App.css";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { loaded } = useApp();
  if (loaded) {
    return <>{children}</>;
  }
  return <>加载中...</>;
};

function App() {
  return (
    <AppProvider>
      <Workspace />

      <Wrapper>
        <ImageTest />
      </Wrapper>

      <ViewportPanel />
      <TitlePanel />
      <ToolbarPanel />
    </AppProvider>
  );
}

export default App;

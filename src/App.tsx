import { AppProvider, useApp } from "./app/index";
import { Workspace } from "./workspace";
import { ImageTest } from "./Image";

import "./App.scss";

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
    </AppProvider>
  );
}

export default App;

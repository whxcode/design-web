import { AppProvider } from "./app/index";

import "./App.scss";

function App() {
  return (
    <AppProvider>
      <div className="w-screen h-screen overflow-hidden">
        <canvas
          id="canvas"
          className="block w-full h-full outline-none"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </AppProvider>
  );
}

export default App;

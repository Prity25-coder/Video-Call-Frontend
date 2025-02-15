import { RouterProvider } from "react-router-dom";
import "./App.css";
import appRoutes from "./app.routes";
import { PeerContextProvider, SocketContextProvider } from "./contexts";

function App() {
  return (
    <div>
      <SocketContextProvider>
        <PeerContextProvider>
          <RouterProvider router={appRoutes} />
        </PeerContextProvider>
      </SocketContextProvider>
    </div>
  );
}

export default App;

import { createBrowserRouter } from "react-router-dom";
import Home from "./components/Home/Home";
import VideoCall from "./components/VideoCall/VideoCall";

const appRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  // {
  //   path: "/videoCall",
  //   element: <VideoCall />,
  // },
  {
    path: "/room/:roomId",
    element: <VideoCall/>,
  },
]);

export default appRoutes;

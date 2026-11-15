import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import { routerConfig } from "./routes.js";

const config = createBrowserRouter(routerConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={config} />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import { routerConfig } from "./routes.js";

// Skapar routern utifrån sidorna i routes.tsx  -- definierar vilka sidor som finns --  navigerar mellan sidorna i forntend utan att hela webbsidan laddas om
const config = createBrowserRouter(routerConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={config} />
  </StrictMode>,
)
// gör att nav funkar och rätt sida visas
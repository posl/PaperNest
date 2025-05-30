import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // ← Appを読み込む

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

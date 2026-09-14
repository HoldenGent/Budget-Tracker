import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/forms.css";
import "./styles/components.css";
import { FinanceProvider } from "./context/FinanceContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </BrowserRouter>
  </StrictMode>,
);
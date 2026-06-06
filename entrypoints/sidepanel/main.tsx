import React from "react";
import ReactDOM from "react-dom/client";
import "../../src/i18n";
import "../../src/styles/globals.css";
import { App } from "../popup/App";
import "../popup/style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

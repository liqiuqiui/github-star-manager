import React from "react";
import ReactDOM from "react-dom/client";
import "../../src/i18n";
import "../../src/styles/globals.css";
import "../../src/styles/popup.css";
import App from "../../src/sidepanel/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

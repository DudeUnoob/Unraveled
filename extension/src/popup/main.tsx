import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./popup.css";
import fabricUrl from "./assets/fabric.png";
import buttonsUrl from "./assets/buttons.png";
import logoUrl from "./assets/logo.png";

document.documentElement.style.setProperty("--fabric-border", `url(${fabricUrl})`);
document.documentElement.style.setProperty("--buttons-bg", `url(${buttonsUrl})`);
document.documentElement.style.setProperty("--logo-url", `url(${logoUrl})`);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
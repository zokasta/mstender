import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "react-notifications-component/dist/theme.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter } from "react-router-dom";
import { ReactNotifications } from "react-notifications-component";
import { AppProvider } from "./database/Context";
import { SettingsProvider } from "./context/SettingsContext";

document.addEventListener("wheel", function (event) {
  const activeElement = document.activeElement;

  if (activeElement && activeElement.type === "number") {
    activeElement.blur();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ReactNotifications />
    <BrowserRouter>
      <SettingsProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

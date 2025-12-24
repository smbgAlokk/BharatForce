import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

// 2. Paste your Client ID here (Ideally use import.meta.env.VITE_GOOGLE_CLIENT_ID)
const GOOGLE_CLIENT_ID =
  "415597452426-3sc8n019n7geaqmmrf305hv38uoo3jvl.apps.googleusercontent.com";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

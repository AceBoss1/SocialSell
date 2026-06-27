// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/index.js
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

// ─── Suppress browser extension noise ────────────────────────────────────────
// MetaMask, Coinbase Wallet and similar crypto extensions inject themselves
// into every page and throw errors when no Web3 provider is found.
// These errors are harmless to SocialSell — we suppress them so they don't
// clutter the console or trigger React's error overlay in development.

const EXTENSION_PATTERNS = [
  "MetaMask",
  "ethereum",
  "web3",
  "chrome-extension://",
  "moz-extension://",
  "Failed to connect to",
  "inpage.js",
];

const isExtensionError = (msg) => {
  if (!msg) return false;
  const str = typeof msg === "string" ? msg : msg?.message ?? String(msg);
  return EXTENSION_PATTERNS.some((p) =>
    str.toLowerCase().includes(p.toLowerCase())
  );
};

// Swallow extension errors in window.onerror
window.addEventListener("error", (event) => {
  if (isExtensionError(event.message) || isExtensionError(event.filename)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Swallow extension errors in unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  if (isExtensionError(event.reason)) {
    event.preventDefault();
  }
});

// Keep original console.error but filter extension noise
const _consoleError = console.error.bind(console);
console.error = (...args) => {
  if (args.some(isExtensionError)) return;
  _consoleError(...args);
};

// ─── Mount app ────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

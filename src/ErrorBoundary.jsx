// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/components/ErrorBoundary.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { Component } from "react";

const P    = "#6C63FF";
const DARK = "#0c0b2e";

// Extension error patterns — boundary ignores these entirely
const EXTENSION_PATTERNS = [
  "MetaMask", "ethereum", "web3",
  "chrome-extension://", "moz-extension://", "inpage.js",
];

const isExtensionError = (msg = "") => {
  const s = typeof msg === "string" ? msg : String(msg?.message ?? msg);
  return EXTENSION_PATTERNS.some((p) => s.toLowerCase().includes(p.toLowerCase()));
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Silently ignore browser extension errors — they are not our bugs
    if (isExtensionError(error?.message)) return { hasError: false, error: null };
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (isExtensionError(error?.message)) return;
    // In production you'd send this to Sentry / LogRocket etc.
    console.error("App error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const msg = this.state.error?.message ?? "An unexpected error occurred.";

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f7ff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 20,
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #ededf5",
          borderRadius: 20,
          padding: "40px 36px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 12px 40px rgba(60,30,120,.1)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>

          <h2 style={{
            fontSize: 20, fontWeight: 800,
            color: DARK, marginBottom: 8,
          }}>
            Something went wrong
          </h2>

          <p style={{
            fontSize: 14, color: "#888",
            lineHeight: 1.6, marginBottom: 20,
          }}>
            The page ran into an unexpected error. Try refreshing — if it keeps
            happening, please contact support.
          </p>

          {/* Error detail (shown in development only) */}
          {process.env.NODE_ENV === "development" && (
            <pre style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 11,
              color: "#991B1B",
              textAlign: "left",
              overflowX: "auto",
              marginBottom: 20,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg}
            </pre>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: P, color: "#fff", border: "none",
                borderRadius: 8, padding: "10px 22px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Refresh page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                background: "#f8f7ff",
                border: "1px solid #e0dfee",
                color: "#555", borderRadius: 8,
                padding: "10px 22px", fontSize: 14,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#bbb", marginTop: 20 }}>
            Error reference: {Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }
}

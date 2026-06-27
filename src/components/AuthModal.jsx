// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/components/AuthModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";

const P    = "#6C63FF";
const DARK = "#0c0b2e";

// In production replace with: import { auth } from "../lib/supabase";
const mockAuth = {
  signIn: async ({ email, password }) => {
    await new Promise(r => setTimeout(r, 900));
    // Mock role routing — in production Supabase returns the real role
    if (email.includes("superadmin")) return { role: "super_admin" };
    if (email.includes("affiliate"))  return { role: "affiliate" };
    return { role: "vendor" };
  },
  signUp: async ({ email, password, displayName, role }) => {
    await new Promise(r => setTimeout(r, 900));
    return { role };
  },
  resetPassword: async (email) => {
    await new Promise(r => setTimeout(r, 700));
  },
};

function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#555",
        display: "block", marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e0dfee",
          borderRadius: 10, fontSize: 14, outline: "none",
          background: "#fafafe", color: DARK }} />
    </div>
  );
}

function Btn({ children, onClick, disabled, loading, variant = "primary", style = {} }) {
  const base = {
    width: "100%", padding: "11px", fontSize: 14, fontWeight: 700,
    borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, transition: "opacity .2s", ...style,
  };
  const styles = {
    primary:  { background: P, color: "#fff" },
    outline:  { background: "transparent", color: P, border: `1.5px solid ${P}` },
    ghost:    { background: "#f5f5f5", color: "#555" },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...styles[variant] }}>
      {loading ? <span className="spin">⟳</span> : children}
    </button>
  );
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
function SignIn({ onSuccess, onSwitch, onClose }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const result = await mockAuth.signIn({ email, password });
      onSuccess(result);
    } catch (e) {
      setError(e.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 24, fontWeight: 900, color: DARK, marginBottom: 4 }}>
          Welcome back
        </p>
        <p style={{ fontSize: 14, color: "#888" }}>Sign in to your SocialSell account</p>
      </div>

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fecaca",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: "#ef4444" }}>{error}</div>
      )}

      <Input label="Email address" type="email" value={email}
        onChange={setEmail} placeholder="you@example.com" />
      <Input label="Password" type="password" value={password}
        onChange={setPassword} placeholder="••••••••" />

      <div style={{ textAlign: "right", marginBottom: 18 }}>
        <button onClick={() => onSwitch("forgot")}
          style={{ background: "none", border: "none", color: P,
            fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 600 }}>
          Forgot password?
        </button>
      </div>

      <Btn onClick={submit} loading={loading}>Sign in</Btn>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
        Don't have an account?{" "}
        <button onClick={() => onSwitch("signup")}
          style={{ background: "none", border: "none", color: P,
            cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          Create one
        </button>
      </div>

      {/* Social logins */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#e0dfee" }} />
          <span style={{ fontSize: 12, color: "#bbb" }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: "#e0dfee" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["🇬 Google", "#fff", "#555", "#e0dfee"],
            ["𝔽 Facebook", "#1877F2", "#fff", "#1877F2"]].map(([label, bg, color, border]) => (
            <button key={label}
              style={{ padding: "9px", border: `1px solid ${border}`, borderRadius: 9,
                background: bg, color, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
function SignUp({ onSuccess, onSwitch }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("vendor");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    try {
      const result = await mockAuth.signUp({ email, password, displayName: name, role });
      onSuccess(result);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 24, fontWeight: 900, color: DARK, marginBottom: 4 }}>
          Create your account
        </p>
        <p style={{ fontSize: 14, color: "#888" }}>Join 50,000+ creators on SocialSell</p>
      </div>

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fecaca",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: "#ef4444" }}>{error}</div>
      )}

      <Input label="Full name" value={name} onChange={setName} placeholder="Amara Diallo" />
      <Input label="Email address" type="email" value={email}
        onChange={setEmail} placeholder="you@example.com" />
      <Input label="Password" type="password" value={password}
        onChange={setPassword} placeholder="Min. 8 characters" />

      {/* Role selector */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#555",
          display: "block", marginBottom: 8 }}>I want to…</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["vendor",    "🏪", "Sell products",    "Open a creator store"],
            ["affiliate", "🔗", "Earn commissions", "Promote and refer"]].map(([val, icon, title, sub]) => (
            <div key={val} onClick={() => setRole(val)}
              style={{ border: `1.5px solid ${role===val ? P : "#e0dfee"}`,
                borderRadius: 10, padding: "12px 10px", cursor: "pointer",
                background: role===val ? "#EEEDFE" : "#fff",
                transition: "all .15s" }}>
              <p style={{ fontSize: 20, marginBottom: 4 }}>{icon}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 2 }}>{title}</p>
              <p style={{ fontSize: 11, color: "#aaa" }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <Btn onClick={submit} loading={loading}>Create account</Btn>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
        Already have an account?{" "}
        <button onClick={() => onSwitch("signin")}
          style={{ background: "none", border: "none", color: P,
            cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
          Sign in
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 14 }}>
        By signing up you agree to our{" "}
        <a href="#" style={{ color: P }}>Terms</a> and{" "}
        <a href="#" style={{ color: P }}>Privacy Policy</a>.
      </p>
    </>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotPassword({ onSwitch }) {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    await mockAuth.resetPassword(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 24, fontWeight: 900, color: DARK, marginBottom: 4 }}>
          Reset password
        </p>
        <p style={{ fontSize: 14, color: "#888" }}>
          We'll send a reset link to your email.
        </p>
      </div>

      {sent ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📬</p>
          <p style={{ fontWeight: 700, fontSize: 15, color: DARK, marginBottom: 6 }}>
            Check your inbox
          </p>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
            We sent a reset link to <strong>{email}</strong>
          </p>
          <Btn onClick={() => onSwitch("signin")} variant="ghost">Back to sign in</Btn>
        </div>
      ) : (
        <>
          <Input label="Email address" type="email" value={email}
            onChange={setEmail} placeholder="you@example.com" />
          <div style={{ height: 8 }} />
          <Btn onClick={submit} loading={loading}>Send reset link</Btn>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => onSwitch("signin")}
              style={{ background: "none", border: "none", color: P,
                cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              ← Back to sign in
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
export default function AuthModal({ onSuccess, onClose, defaultScreen = "signin" }) {
  const [screen, setScreen] = useState(defaultScreen);

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <span style={{ fontSize: 28 }}>📦</span>
          <p style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>SocialSell</p>
        </div>

        {screen === "signin"  && <SignIn  onSuccess={onSuccess} onSwitch={setScreen} onClose={onClose} />}
        {screen === "signup"  && <SignUp  onSuccess={onSuccess} onSwitch={setScreen} />}
        {screen === "forgot"  && <ForgotPassword onSwitch={setScreen} />}
      </div>
    </div>
  );
}

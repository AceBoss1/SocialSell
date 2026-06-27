// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
//
// ACCESS ROUTES
// ─────────────────────────────────────────────────────────────────────────────
//  Public landing    /                  anyone
//  Auth modal        triggered by nav   sign in / sign up
//  Seller dashboard  role = vendor      /dashboard
//  Affiliate portal  role = affiliate   /affiliate
//  Super admin       role = super_admin /admin
//
// HOW ROLES ARE ASSIGNED (in Supabase):
//  Default signup     → role = 'customer'
//  Become a vendor    → user upgrades plan; Edge Fn sets role = 'vendor'
//  Become affiliate   → admin approves; Edge Fn sets role = 'affiliate'
//  Super admin        → run SQL:
//    UPDATE profiles SET role = 'super_admin' WHERE id = '<your-uuid>';
//
// In development the AuthModal lets you pick any role to preview each portal.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import "./index.css";
import SuperAdmin        from "./components/SuperAdmin";
import AffiliateDashboard from "./components/AffiliateDashboard";

// ─── Lazy-import seller dashboard views (inline here for now) ─────────────────
// When you split files, replace the inline Dashboard below with:
//   import Dashboard from "./components/Dashboard";

// ─── Design tokens ────────────────────────────────────────────────────────────
const P    = "#6C63FF";
const DARK = "#0c0b2e";

// ─── Role definitions ─────────────────────────────────────────────────────────
const ROLES = [
  {
    id:    "customer",
    icon:  "🛍️",
    label: "Customer",
    desc:  "Browse and buy digital products.",
    color: "#10b981",
    bg:    "#d1fae5",
  },
  {
    id:    "vendor",
    icon:  "🏪",
    label: "Seller / Vendor",
    desc:  "Sell your own digital products (Pro plan).",
    color: P,
    bg:    "#EEEDFE",
  },
  {
    id:    "affiliate",
    icon:  "🔗",
    label: "Affiliate",
    desc:  "Promote products and earn commissions.",
    color: "#f59e0b",
    bg:    "#FEF9C3",
  },
  {
    id:    "super_admin",
    icon:  "⚡",
    label: "Super Admin",
    desc:  "Platform owner — full control.",
    color: "#ef4444",
    bg:    "#FEE2E2",
  },
];

// ─── Mock session ─────────────────────────────────────────────────────────────
// Replace with:  import { useAuth } from "./hooks/useAuth";
// and:           const { user, profile, signIn, signUp, signOut } = useAuth();
function useMockAuth() {
  const [user, setUser]     = useState(null);   // null = logged out
  const [loading, setLoading] = useState(false);

  const signIn = async ({ email, password, role }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));  // simulate network
    setUser({ id: "usr_001", email, role, name: email.split("@")[0] });
    setLoading(false);
  };

  const signOut = () => setUser(null);

  return { user, loading, signIn, signOut };
}

// ─── Auth modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode]       = useState("signin");   // "signin" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [role, setRole]       = useState("customer");
  const [error, setError]     = useState("");
  const { signIn, loading }   = useMockAuth();

  const submit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    try {
      await signIn({ email, password, role });
      onSuccess({ email, role, name: name || email.split("@")[0] });
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
  };

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-card fade-in">

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <p style={{ fontSize:24, marginBottom:6 }}>📦</p>
          <h2 style={{ fontSize:20, fontWeight:900, color:DARK, marginBottom:4 }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize:13, color:"#888" }}>
            {mode === "signin"
              ? "Sign in to access your dashboard."
              : "Join 50,000+ creators on SocialSell."}
          </p>
        </div>

        {/* Fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
          {mode === "signup" && (
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#555",
                display:"block", marginBottom:4 }}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ada Okonkwo" />
            </div>
          )}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#555",
              display:"block", marginBottom:4 }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#555",
              display:"block", marginBottom:4 }}>Password</label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" />
          </div>

          {/* Role selector — shown on signup, or in dev mode */}
          {(mode === "signup" || process.env.NODE_ENV === "development") && (
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#555",
                display:"block", marginBottom:8 }}>
                Account type
                {process.env.NODE_ENV === "development" && (
                  <span style={{ marginLeft:6, fontSize:10,
                    color:P, fontWeight:700 }}>DEV — any role</span>
                )}
              </label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {ROLES.map(r => (
                  <label key={r.id} onClick={() => setRole(r.id)}
                    style={{ display:"flex", alignItems:"flex-start", gap:8,
                      padding:"10px 12px",
                      border:`1.5px solid ${role===r.id ? r.color : "#e0dfee"}`,
                      borderRadius:10, cursor:"pointer",
                      background: role===r.id ? r.bg : "#fff",
                      transition:"all .15s" }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{r.icon}</span>
                    <div>
                      <p style={{ fontSize:12, fontWeight:700,
                        color: role===r.id ? r.color : DARK,
                        marginBottom:1 }}>{r.label}</p>
                      <p style={{ fontSize:10, color:"#aaa",
                        lineHeight:1.4 }}>{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background:"#FEE2E2", color:"#991B1B",
            borderRadius:8, padding:"8px 12px",
            fontSize:13, marginBottom:12 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={submit} disabled={loading}
          style={{ width:"100%", background:P, color:"#fff",
            borderRadius:10, padding:"12px", fontSize:14,
            fontWeight:800, marginBottom:14,
            opacity:loading?0.7:1 }}>
          {loading
            ? <span><span className="spin">⟳</span> {" "}Please wait…</span>
            : mode === "signin" ? "Sign in →" : "Create account →"}
        </button>

        {/* OAuth */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[["Google","🔵"],["Facebook","🔷"]].map(([name,icon]) => (
            <button key={name}
              style={{ flex:1, background:"#f8f7ff", border:"1px solid #e0dfee",
                color:DARK, borderRadius:10, padding:"10px",
                fontSize:13, fontWeight:600 }}>
              {icon} {name}
            </button>
          ))}
        </div>

        {/* Toggle mode */}
        <p style={{ textAlign:"center", fontSize:13, color:"#888" }}>
          {mode === "signin"
            ? <>Don't have an account?{" "}
                <button onClick={() => setMode("signup")}
                  style={{ background:"none", color:P, padding:0,
                    fontWeight:700, fontSize:13 }}>
                  Sign up
                </button></>
            : <>Already have an account?{" "}
                <button onClick={() => setMode("signin")}
                  style={{ background:"none", color:P, padding:0,
                    fontWeight:700, fontSize:13 }}>
                  Sign in
                </button></>}
        </p>
      </div>
    </div>
  );
}

// ─── Seller / Vendor Dashboard (inline, extract to its own file later) ────────
function SellerDashboard({ user, onSignOut }) {
  const [view, setView] = useState("overview");

  const NAV = [
    ["overview",   "📊","Overview"],
    ["products",   "📦","My Products"],
    ["analytics",  "📈","Analytics"],
    ["publishing", "📢","Publishing"],
    ["customers",  "👥","Customers"],
    ["affiliate",  "🔗","Affiliates"],
    ["payouts",    "💸","Payouts"],
    ["settings",   "⚙️","Settings"],
  ];

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar"
        style={{ background:DARK, display:"flex",
          flexDirection:"column", padding:"20px 0" }}>
        <div style={{ padding:"0 16px 18px",
          borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          <p style={{ color:"#fff", fontWeight:900,
            fontSize:15, marginBottom:2 }}>📦 SocialSell</p>
          <p style={{ color:"rgba(255,255,255,.3)",
            fontSize:11, marginBottom:14 }}>Seller Dashboard</p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%",
              background:P, display:"flex", alignItems:"center",
              justifyContent:"center", color:"#fff",
              fontWeight:800, fontSize:14, flexShrink:0 }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p className="truncate"
                style={{ color:"#fff", fontWeight:700, fontSize:13 }}>
                {user.name}
              </p>
              <span style={{ fontSize:10, fontWeight:700,
                color:P, background:"#EEEDFE",
                padding:"1px 7px", borderRadius:999 }}>Pro plan</span>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:"12px 8px",
          display:"flex", flexDirection:"column", gap:2 }}>
          {NAV.map(([id,icon,label]) => (
            <button key={id} onClick={() => setView(id)}
              style={{ display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", borderRadius:8, border:"none",
                background: view===id ? "rgba(108,99,255,.22)" : "transparent",
                color: view===id ? "#a78bfa" : "rgba(255,255,255,.45)",
                fontSize:13, fontWeight: view===id ? 700 : 400,
                textAlign:"left", cursor:"pointer",
                transition:"all .15s" }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"12px 16px",
          borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <button onClick={onSignOut}
            style={{ width:"100%", background:"rgba(239,68,68,.12)",
              color:"#fca5a5", border:"1px solid rgba(239,68,68,.2)",
              borderRadius:8, padding:"8px", fontSize:12,
              fontWeight:600, cursor:"pointer" }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main" style={{ padding:"32px 36px" }}>
        {view === "overview" && <SellerOverview />}
        {view !== "overview" && (
          <div style={{ padding:"40px 0", textAlign:"center" }}>
            <p style={{ fontSize:40, marginBottom:12 }}>🚧</p>
            <p style={{ fontWeight:700, fontSize:18,
              color:DARK, marginBottom:6 }}>
              {NAV.find(n=>n[0]===view)?.[2]} section
            </p>
            <p style={{ color:"#888", fontSize:14 }}>
              Extract from the previous Dashboard component
              in <code>src/components/Dashboard.jsx</code>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function SellerOverview() {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun"];
  const REV    = [8200,11400,9800,15600,13200,19800];
  const max    = Math.max(...REV);

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800,
        color:DARK, marginBottom:4 }}>Overview</h2>
      <p style={{ fontSize:14, color:"#888", marginBottom:24 }}>
        Your store performance at a glance.
      </p>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14, marginBottom:24 }}>
        {[["Total Revenue","$78,400","+24%","💰"],
          ["Total Sales","1,369","+18%","🛍️"],
          ["Active Products","8","+2","📦"],
          ["Platforms Live","5 / 8","","🌐"]].map(([l,v,c,i])=>(
          <div key={l} style={{ background:"#fff",
            border:"1px solid var(--border)",
            borderRadius:14, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              marginBottom:10 }}>
              <p style={{ fontSize:12, color:"#aaa", fontWeight:600 }}>{l}</p>
              <span style={{ fontSize:20 }}>{i}</span>
            </div>
            <p style={{ fontSize:26, fontWeight:900,
              color:DARK, marginBottom:4 }}>{v}</p>
            {c && <p style={{ fontSize:12, color:"#10b981",
              fontWeight:700 }}>{c} vs last month</p>}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background:"#fff", border:"1px solid var(--border)",
        borderRadius:14, padding:22 }}>
        <p style={{ fontWeight:700, fontSize:14, color:DARK,
          marginBottom:20 }}>Revenue — last 6 months</p>
        <div style={{ display:"flex", alignItems:"flex-end",
          gap:10, height:130 }}>
          {REV.map((v,i) => (
            <div key={i} style={{ flex:1, display:"flex",
              flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{ width:"100%", background:P,
                borderRadius:"5px 5px 0 0",
                height:`${(v/max)*110}px`,
                transition:"height .6s" }} />
              <span style={{ fontSize:10, color:"#aaa" }}>
                {MONTHS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Landing page sections (imported from previous App.jsx) ───────────────────
// — kept here in condensed form so App.jsx is self-contained —
// — for full sections see the landing page code built previously —

function LandingPage({ onOpenAuth, currency, setCurrency, language, setLanguage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const LANG_HERO = {
    en: ["Turn Social Media Into Your", "Sales Machine"],
    fr: ["Transformez les réseaux sociaux en", "Machine à Vendre"],
    es: ["Convierte las Redes Sociales en Tu", "Máquina de Ventas"],
    pt: ["Transforme as Redes Sociais na sua", "Máquina de Vendas"],
  };
  const [line1, line2] = LANG_HERO[language] || LANG_HERO.en;

  const CURRENCIES = ["USD","NGN","EUR","GBP","GHS","KES"];
  const LANGUAGES  = [["en","EN"],["fr","FR"],["es","ES"],["pt","PT"]];

  return (
    <div>
      {/* Nav */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(12,11,46,.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition:"background .3s",
        padding:"0 5%", display:"flex",
        alignItems:"center", height:60, gap:20 }}>
        <span style={{ color:"#fff", fontWeight:900,
          fontSize:17, flexShrink:0 }}>📦 SocialSell</span>

        <div style={{ display:"flex", gap:20, flex:1 }}>
          {["Products","Platforms","Pricing","Reviews"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ color:"rgba(255,255,255,.6)", fontSize:13 }}>{l}</a>
          ))}
        </div>

        {/* Currency */}
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          style={{ fontSize:12, background:"rgba(255,255,255,.08)",
            color:"rgba(255,255,255,.8)",
            border:"1px solid rgba(255,255,255,.2)",
            borderRadius:6, padding:"4px 8px",
            cursor:"pointer", width:"auto" }}>
          {CURRENCIES.map(c =>
            <option key={c} value={c} style={{ background:"#1a1a3e" }}>{c}</option>)}
        </select>

        {/* Language */}
        <select value={language} onChange={e => setLanguage(e.target.value)}
          style={{ fontSize:12, background:"rgba(255,255,255,.08)",
            color:"rgba(255,255,255,.8)",
            border:"1px solid rgba(255,255,255,.2)",
            borderRadius:6, padding:"4px 8px",
            cursor:"pointer", width:"auto" }}>
          {LANGUAGES.map(([code,lbl]) =>
            <option key={code} value={code}
              style={{ background:"#1a1a3e" }}>{lbl}</option>)}
        </select>

        <button onClick={() => onOpenAuth("signin")}
          style={{ background:"transparent",
            border:"1px solid rgba(255,255,255,.3)",
            color:"rgba(255,255,255,.8)", borderRadius:7,
            padding:"7px 16px", fontSize:13 }}>
          Sign in
        </button>
        <button onClick={() => onOpenAuth("signup")}
          style={{ background:P, border:"none",
            color:"#fff", borderRadius:7,
            padding:"7px 16px", fontSize:13,
            fontWeight:700 }}>
          Try for Free
        </button>
      </nav>

      {/* Hero */}
      <section style={{ background:
          `linear-gradient(145deg, ${DARK} 0%, #1a0e5c 55%, #0f0e2a 100%)`,
        minHeight:"100vh", display:"flex", alignItems:"center",
        padding:"100px 5% 80px", position:"relative", overflow:"hidden" }}>

        {/* Orbs */}
        <div style={{ position:"absolute", top:"15%", right:"8%",
          width:400, height:400,
          background:`radial-gradient(circle, ${P}22 0%, transparent 70%)`,
          pointerEvents:"none" }} />

        <div style={{ display:"grid",
          gridTemplateColumns:"1fr 1fr", gap:60,
          alignItems:"center", width:"100%",
          maxWidth:1200, margin:"0 auto" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center",
              gap:8, background:"rgba(108,99,255,.15)",
              border:`1px solid ${P}55`, borderRadius:999,
              padding:"5px 16px", fontSize:12, color:"#a78bfa",
              marginBottom:24, fontWeight:600 }}>
              🚀 All-in-one Social Commerce Platform
            </div>
            <h1 style={{ color:"#fff", fontSize:46, fontWeight:900,
              lineHeight:1.1, marginBottom:20 }}>
              {line1}<br/>
              <span style={{ color:"#818cf8" }}>{line2}</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,.55)", fontSize:15,
              lineHeight:1.8, marginBottom:32, maxWidth:480 }}>
              The ultimate platform for digital creators — sell courses, 
              templates, ebooks, beats across every social platform, all 
              from one dashboard.
            </p>
            <div style={{ display:"flex", gap:12, marginBottom:40 }}>
              <button onClick={() => onOpenAuth("signup")}
                style={{ background:P, border:"none", color:"#fff",
                  borderRadius:10, padding:"13px 28px",
                  fontSize:15, fontWeight:700 }}>
                Start selling free →
              </button>
              <button style={{ background:"transparent",
                border:"1px solid rgba(255,255,255,.25)",
                color:"#fff", borderRadius:10,
                padding:"13px 24px", fontSize:15 }}>
                View plans
              </button>
            </div>
            <div style={{ display:"flex", gap:40 }}>
              {[["50K+","Sellers"],["$12M+","Revenue"],["4.9★","Rating"]].map(([v,l])=>(
                <div key={l}>
                  <p style={{ color:"#fff", fontSize:22,
                    fontWeight:900, marginBottom:2 }}>{v}</p>
                  <p style={{ color:"rgba(255,255,255,.4)", fontSize:12 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ background:"rgba(255,255,255,.05)",
              border:"1px solid rgba(255,255,255,.1)",
              borderRadius:20, padding:22, width:320,
              backdropFilter:"blur(10px)" }}>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:10,
                letterSpacing:".1em", textTransform:"uppercase",
                marginBottom:12 }}>Live dashboard preview</p>
              <div style={{ background:`linear-gradient(135deg,${P},#4f46e5)`,
                borderRadius:12, height:130, marginBottom:14,
                display:"flex", alignItems:"center",
                justifyContent:"center", textAlign:"center" }}>
                <div>
                  <p style={{ color:"rgba(255,255,255,.7)",
                    fontSize:11, marginBottom:4 }}>Total earnings</p>
                  <p style={{ color:"#fff", fontSize:32, fontWeight:900 }}>$12,480</p>
                  <p style={{ color:"#a5f3fc", fontSize:11 }}>▲ 24% this month</p>
                </div>
              </div>
              {[["Active listings","47"],["Monthly sales","312"],["Platforms","5 live"]].map(([l,v])=>(
                <div key={l} style={{ display:"flex",
                  justifyContent:"space-between",
                  padding:"8px 0",
                  borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  <span style={{ color:"rgba(255,255,255,.4)", fontSize:12 }}>{l}</span>
                  <span style={{ color:P, fontSize:12, fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform strip */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0,
          background:"rgba(0,0,0,.25)",
          borderTop:"1px solid rgba(255,255,255,.06)",
          padding:"12px 5%", display:"flex",
          alignItems:"center", justifyContent:"center",
          gap:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.3)",
            marginRight:6 }}>Sell across:</span>
          {["Instagram","TikTok","Facebook","X / Twitter",
            "Pinterest","YouTube","LinkedIn"].map(p => (
            <span key={p} style={{ fontSize:12,
              color:"rgba(255,255,255,.45)",
              padding:"3px 12px",
              border:"1px solid rgba(255,255,255,.1)",
              borderRadius:999 }}>{p}</span>
          ))}
        </div>
      </section>

      {/* Portal access section */}
      <section style={{ padding:"72px 5%", background:"#f8f7ff" }}>
        <p style={{ textAlign:"center", fontSize:12, color:P,
          fontWeight:700, letterSpacing:".1em",
          textTransform:"uppercase", marginBottom:8 }}>
          Role-based access
        </p>
        <h2 style={{ textAlign:"center", fontSize:32, fontWeight:900,
          color:DARK, marginBottom:10 }}>
          One platform, four portals
        </h2>
        <p style={{ textAlign:"center", color:"#888",
          fontSize:15, marginBottom:48 }}>
          Every account type gets their own purpose-built dashboard.
        </p>

        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
          gap:20, maxWidth:1000, margin:"0 auto" }}>
          {[
            { role:"customer",    icon:"🛍️", label:"Customer",
              color:"#10b981", bg:"#d1fae5",
              desc:"Browse the marketplace, buy products, view your download library and manage your account.",
              access:"Sign up free" },
            { role:"vendor",      icon:"🏪", label:"Seller / Vendor",
              color:P, bg:"#EEEDFE",
              desc:"Manage your store, products, analytics, publishing schedule, affiliates and payouts.",
              access:"Pro plan required" },
            { role:"affiliate",   icon:"🔗", label:"Affiliate",
              color:"#f59e0b", bg:"#FEF9C3",
              desc:"Track referral links, commissions, tier progress, leaderboard rank and payout history.",
              access:"Invite or apply" },
            { role:"super_admin", icon:"⚡", label:"Super Admin",
              color:"#ef4444", bg:"#FEE2E2",
              desc:"Full platform control: all vendors, all orders, payouts, moderation queue and settings.",
              access:"Owner only (SQL)" },
          ].map(p => (
            <div key={p.role}
              style={{ background:"#fff",
                border:`1.5px solid ${p.color}30`,
                borderRadius:16, padding:22,
                display:"flex", flexDirection:"column" }}>
              <div style={{ width:48, height:48, borderRadius:12,
                background:p.bg, display:"flex",
                alignItems:"center", justifyContent:"center",
                fontSize:24, marginBottom:14 }}>
                {p.icon}
              </div>
              <p style={{ fontWeight:800, fontSize:16,
                color:DARK, marginBottom:6 }}>{p.label}</p>
              <p style={{ fontSize:13, color:"#666",
                lineHeight:1.6, flex:1, marginBottom:14 }}>
                {p.desc}
              </p>
              <div style={{ display:"flex", alignItems:"center",
                justifyContent:"space-between" }}>
                <span style={{ fontSize:11, fontWeight:700,
                  color:p.color, background:p.bg,
                  padding:"3px 10px", borderRadius:999 }}>
                  {p.access}
                </span>
                <button onClick={() => onOpenAuth("signup")}
                  style={{ background:p.color, color:"#fff",
                    border:"none", borderRadius:8,
                    padding:"6px 14px", fontSize:12,
                    fontWeight:700 }}>
                  {p.role === "super_admin" ? "Docs →" : "Join →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer strip */}
      <section style={{ background:`linear-gradient(135deg,${P},#4f46e5)`,
        padding:"56px 5%", textAlign:"center" }}>
        <h2 style={{ color:"#fff", fontSize:30,
          fontWeight:900, marginBottom:10 }}>
          Ready to start selling?
        </h2>
        <p style={{ color:"rgba(255,255,255,.75)",
          fontSize:15, marginBottom:24 }}>
          Free plan available. No credit card required.
        </p>
        <button onClick={() => onOpenAuth("signup")}
          style={{ background:"#fff", color:P, border:"none",
            borderRadius:10, padding:"13px 32px",
            fontSize:15, fontWeight:900 }}>
          Create free account →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background:DARK, padding:"44px 5% 24px" }}>
        <div style={{ display:"grid",
          gridTemplateColumns:"2fr 1fr 1fr 1fr",
          gap:32, maxWidth:1100, margin:"0 auto 32px" }}>
          <div>
            <p style={{ color:"#fff", fontWeight:900,
              fontSize:18, marginBottom:10 }}>📦 SocialSell</p>
            <p style={{ color:"rgba(255,255,255,.35)",
              fontSize:13, lineHeight:1.8, maxWidth:260 }}>
              The complete platform for selling digital products 
              across every social channel.
            </p>
          </div>
          {[["Product",["Marketplace","Creator Stores","Analytics","Affiliates"]],
            ["Company", ["About","Blog","Careers","Press"]],
            ["Legal",   ["Privacy","Terms","Security","GDPR"]]].map(([h,ls]) => (
            <div key={h}>
              <p style={{ color:"#fff", fontWeight:700,
                fontSize:13, marginBottom:12 }}>{h}</p>
              {ls.map(l => (
                <p key={l} style={{ color:"rgba(255,255,255,.35)",
                  fontSize:13, marginBottom:8,
                  cursor:"pointer" }}>{l}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.07)",
          paddingTop:20, textAlign:"center" }}>
          <p style={{ color:"rgba(255,255,255,.25)", fontSize:12 }}>
            © 2026 SocialSell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading, signIn, signOut } = useMockAuth();
  const [showAuth,  setShowAuth]  = useState(false);
  const [authMode,  setAuthMode]  = useState("signin");
  const [currency,  setCurrency]  = useState("USD");
  const [language,  setLanguage]  = useState("en");

  // ── After successful sign-in, close modal ────────────────────────────────────
  const handleAuthSuccess = (userData) => {
    signIn(userData);          // sets user in state
    setShowAuth(false);
  };

  const openAuth = (mode = "signin") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // ── Route based on role ──────────────────────────────────────────────────────
  if (user) {
    switch (user.role) {
      case "super_admin":
        return <SuperAdmin onExit={signOut} />;

      case "affiliate":
        return <AffiliateDashboard onExit={signOut} />;

      case "vendor":
        return <SellerDashboard user={user} onSignOut={signOut} />;

      case "customer":
      default:
        // Customers stay on the landing page but with a top-right account menu
        // (add a customer account view / downloads page here later)
        break;
    }
  }

  // ── Public landing page (unauthenticated or customer) ────────────────────────
  return (
    <>
      <LandingPage
        onOpenAuth={openAuth}
        currency={currency}  setCurrency={setCurrency}
        language={language}  setLanguage={setLanguage}
      />

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}

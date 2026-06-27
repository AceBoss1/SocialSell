// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/components/AffiliateDashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const P    = "#6C63FF";
const DARK = "#0c0b2e";

const TIER_META = {
  Bronze:   { rate:10, min:0,   max:25,  color:"#92400E", bg:"#FEF3C7", next:"Silver",   icon:"🥉" },
  Silver:   { rate:12, min:26,  max:75,  color:"#475569", bg:"#F1F5F9", next:"Gold",     icon:"🥈" },
  Gold:     { rate:15, min:76,  max:150, color:"#B45309", bg:"#FEF9C3", next:"Platinum", icon:"🥇" },
  Platinum: { rate:20, min:151, max:999, color:"#0284C7", bg:"#E0F2FE", next:null,       icon:"💎" },
};

// ─── Mock data (swap for Supabase queries) ────────────────────────────────────
const ME = {
  id:          "aff_001",
  name:        "Amara Diallo",
  email:       "amara@example.com",
  code:        "AMARA30",
  tier:        "Platinum",
  joined:      "Jan 2025",
  country:     "🇳🇬",
  balance:     1240.50,
  totalEarned: 4432,
  totalPaid:   3191.50,
  nextPayout:  "Jun 27",
};

const MY_LINKS = [
  { id:1, label:"Homepage link",        slug:"",                    clicks:2104, conversions:89,  earned:1780 },
  { id:2, label:"AI Prompt Bible",      slug:"ai-prompt-bible",     clicks:1830, conversions:74,  earned:1480 },
  { id:3, label:"TikTok Templates",     slug:"tiktok-templates",    clicks:790,  conversions:28,  earned:560  },
  { id:4, label:"DesignLab store",      slug:"store/designlab",     clicks:376,  conversions:20,  earned:612  },
];

const COMMISSIONS = [
  { id:"COM-081", product:"AI Prompt Bible",          buyer:"Ada O.",    sale:39,  comm:7.80,  date:"Jun 22", status:"cleared"  },
  { id:"COM-080", product:"Social Media Masterclass", buyer:"James R.",  sale:79,  comm:15.80, date:"Jun 21", status:"cleared"  },
  { id:"COM-079", product:"TikTok Template Pack",     buyer:"Priya N.",  sale:29,  comm:5.80,  date:"Jun 21", status:"cleared"  },
  { id:"COM-078", product:"Brand Identity Kit",       buyer:"Carlos R.", sale:59,  comm:11.80, date:"Jun 20", status:"pending"  },
  { id:"COM-077", product:"AI Prompt Bible",          buyer:"Kwame A.",  sale:39,  comm:7.80,  date:"Jun 20", status:"cleared"  },
  { id:"COM-076", product:"SEO Playbook 2025",        buyer:"Sofia M.",  sale:19,  comm:3.80,  date:"Jun 19", status:"cleared"  },
  { id:"COM-075", product:"Beat Collection Vol. 1",   buyer:"Emeka N.",  sale:45,  comm:9.00,  date:"Jun 18", status:"pending"  },
  { id:"COM-074", product:"Social Media Masterclass", buyer:"Ngozi A.",  sale:79,  comm:15.80, date:"Jun 17", status:"cleared"  },
];

const PAYOUTS = [
  { id:"PAY-012", amount:1280.00, currency:"NGN", method:"Paystack", status:"completed", date:"Jun 14" },
  { id:"PAY-011", amount:980.50,  currency:"NGN", method:"Paystack", status:"completed", date:"May 28" },
  { id:"PAY-010", amount:931.00,  currency:"NGN", method:"Paystack", status:"completed", date:"May 14" },
];

const LEADERBOARD = [
  { rank:1, name:"Amara Diallo",   code:"AMARA30",  sales:211, earned:4432, tier:"Platinum", isMe:true  },
  { rank:2, name:"Nkechi Obi",     code:"NKECHI20", sales:143, earned:2144, tier:"Gold"               },
  { rank:3, name:"Kwame Asante",   code:"KWAME15",  sales:89,  earned:1068, tier:"Silver"             },
  { rank:4, name:"Tunde Adeyemi", code:"TUNDE10",  sales:34,  earned:340,  tier:"Bronze"             },
  { rank:5, name:"Fatima Bah",     code:"FATIMA25", sales:22,  earned:220,  tier:"Bronze"             },
];

const PROMOTABLE = [
  { id:1, name:"AI Prompt Bible",          vendor:"AICreators", price:39,  cover:"🤖", rating:4.9 },
  { id:2, name:"Social Media Masterclass", vendor:"CreatorHub", price:79,  cover:"🎓", rating:4.8 },
  { id:3, name:"TikTok Template Pack",     vendor:"DesignLab",  price:29,  cover:"🎨", rating:4.7 },
  { id:4, name:"Beat Collection Vol. 1",   vendor:"BeatMaker",  price:45,  cover:"🎵", rating:4.8 },
  { id:5, name:"Brand Identity Kit",       vendor:"DesignLab",  price:59,  cover:"✏️", rating:4.8 },
  { id:6, name:"SEO Playbook 2025",        vendor:"GrowthLab",  price:19,  cover:"📖", rating:4.6 },
];

const WEEK_CLICKS = [82,120,95,140,108,175,190];
const WEEK_CONV   = [3,  5,  4,  6,  4,  8,  7];
const WEEK_DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Shared components ────────────────────────────────────────────────────────
function Pill({ label, color, bg }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, color, background:bg,
      padding:"2px 9px", borderRadius:999, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #ededf5",
      borderRadius:14, padding:20, ...style }}>
      {children}
    </div>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom:22 }}>
      <h2 style={{ fontSize:20, fontWeight:800, color:DARK, marginBottom:4 }}>{title}</h2>
      <p style={{ fontSize:14, color:"#888" }}>{sub}</p>
    </div>
  );
}

function StatCard({ label, value, sub, icon, valueColor = DARK }) {
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <p style={{ fontSize:12, color:"#aaa", fontWeight:600 }}>{label}</p>
        {icon && <span style={{ fontSize:20 }}>{icon}</span>}
      </div>
      <p style={{ fontSize:26, fontWeight:900, color:valueColor, marginBottom:4 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:"#10b981", fontWeight:600 }}>{sub}</p>}
    </Card>
  );
}

function MiniBar({ pct, color = P }) {
  return (
    <div style={{ background:"#f1effe", borderRadius:4, height:6, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(pct,100)}%`, height:"100%",
        background:color, borderRadius:4, transition:"width .5s" }} />
    </div>
  );
}

function BarChart({ data, labels, color = P, height = 90 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", gap:4 }}>
          <div style={{ width:"100%", background:color, borderRadius:"4px 4px 0 0",
            height:`${(v/max)*(height-18)}px`, transition:"height .6s" }} />
          <span style={{ fontSize:9, color:"#aaa" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)}
      style={{ width:40, height:22, borderRadius:999,
        background:on?P:"#ddd", cursor:"pointer", position:"relative",
        transition:"background .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3,
        left:on?20:3, width:16, height:16, borderRadius:"50%",
        background:"#fff", transition:"left .2s",
        boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
  );
}

function CopyBtn({ text, label = "Copy link" }) {
  const [done, setDone] = useState(false);
  const go = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button onClick={go} style={{ background:done?"#10b981":P, color:"#fff",
      border:"none", borderRadius:7, padding:"6px 14px",
      fontSize:12, fontWeight:700, cursor:"pointer",
      transition:"background .2s", flexShrink:0, whiteSpace:"nowrap" }}>
      {done ? "✓ Copied!" : label}
    </button>
  );
}

const buildUrl = (slug) =>
  slug
    ? `https://socialsell.app/${slug}?ref=${ME.code}`
    : `https://socialsell.app?ref=${ME.code}`;

const STATUS_STYLE = {
  cleared:   { color:"#065F46", bg:"#D1FAE5" },
  pending:   { color:"#92400E", bg:"#FEF3C7" },
  completed: { color:"#065F46", bg:"#D1FAE5" },
  requested: { color:"#1D4ED8", bg:"#DBEAFE" },
};

// ─── View: Overview ───────────────────────────────────────────────────────────
function Overview() {
  const tm = TIER_META[ME.tier];
  const salesThisCycle = 211;
  const pct = tm.next
    ? ((salesThisCycle - tm.min) / (tm.max - tm.min)) * 100
    : 100;

  return (
    <div>
      {/* Tier + balance hero */}
      <div style={{ background:`linear-gradient(135deg,${DARK},#1a0e5c)`,
        borderRadius:16, padding:"24px 28px", marginBottom:22,
        display:"grid", gridTemplateColumns:"1fr auto", gap:24, alignItems:"center" }}>
        <div>
          <p style={{ color:"rgba(255,255,255,.45)", fontSize:12, marginBottom:8 }}>Your affiliate tier</p>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <span style={{ fontSize:36 }}>{tm.icon}</span>
            <div>
              <p style={{ color:"#fff", fontWeight:900, fontSize:26, marginBottom:2 }}>{ME.tier}</p>
              <p style={{ color:"#a78bfa", fontSize:13 }}>{tm.rate}% commission on every sale</p>
            </div>
          </div>
          {tm.next ? (
            <>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:12, marginBottom:7 }}>
                {tm.max - salesThisCycle} more sales to reach{" "}
                <strong style={{ color:"#fbbf24" }}>{tm.next}</strong> ({TIER_META[tm.next].rate}% rate)
              </p>
              <div style={{ background:"rgba(255,255,255,.1)", borderRadius:999,
                height:8, overflow:"hidden", maxWidth:340 }}>
                <div style={{ width:`${pct}%`, height:"100%",
                  background:"linear-gradient(90deg,#6C63FF,#a78bfa)",
                  borderRadius:999, transition:"width .7s" }} />
              </div>
            </>
          ) : (
            <p style={{ color:"#fbbf24", fontSize:13, fontWeight:700 }}>
              🏆 Highest tier — maximum 20% commission
            </p>
          )}
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:11, marginBottom:4 }}>Available to withdraw</p>
          <p style={{ color:"#fff", fontWeight:900, fontSize:32, marginBottom:6 }}>
            ${ME.balance.toFixed(2)}
          </p>
          <p style={{ color:"rgba(255,255,255,.35)", fontSize:11, marginBottom:12 }}>
            Payout: {ME.nextPayout}
          </p>
          <button style={{ background:P, border:"none", color:"#fff",
            borderRadius:8, padding:"9px 20px", fontSize:13,
            fontWeight:700, cursor:"pointer" }}>
            Request payout →
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14, marginBottom:22 }}>
        <StatCard label="Total Earned"    value={`$${ME.totalEarned.toLocaleString()}`}
          sub="+$220 this week" icon="💰" valueColor={P} />
        <StatCard label="Total Sales"     value="211"   sub="+7 this week"    icon="🛍️" />
        <StatCard label="Total Clicks"    value="6,100" sub="+340 this week"  icon="👆" />
        <StatCard label="Conversion Rate" value="3.46%" sub="+0.2% this week" icon="📈"
          valueColor="#10b981" />
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr",
        gap:16, marginBottom:22 }}>
        <Card>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:3 }}>
            This week — clicks & conversions
          </p>
          <p style={{ fontSize:12, color:"#aaa", marginBottom:16 }}>Daily activity</p>
          <p style={{ fontSize:11, color:"#aaa", fontWeight:700, textTransform:"uppercase",
            letterSpacing:".05em", marginBottom:8 }}>Clicks</p>
          <BarChart data={WEEK_CLICKS} labels={WEEK_DAYS} color={P} height={90} />
          <p style={{ fontSize:11, color:"#aaa", fontWeight:700, textTransform:"uppercase",
            letterSpacing:".05em", margin:"16px 0 8px" }}>Conversions</p>
          <BarChart data={WEEK_CONV} labels={WEEK_DAYS} color="#10b981" height={65} />
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <p style={{ fontSize:12, color:"#aaa", marginBottom:8 }}>🔥 Top link this week</p>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:3 }}>AI Prompt Bible</p>
            <p style={{ fontSize:12, color:"#aaa", marginBottom:10 }}>1,830 clicks · 74 sales</p>
            <div style={{ background:"#EEEDFE", borderRadius:8,
              padding:"8px 12px", fontSize:13, color:P, fontWeight:700 }}>
              $1,480 earned
            </div>
          </Card>
          <Card>
            <p style={{ fontSize:12, color:"#aaa", fontWeight:600, marginBottom:12 }}>Tier ladder</p>
            {Object.entries(TIER_META).map(([tier, m]) => (
              <div key={tier} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:9 }}>
                <Pill label={`${m.icon} ${tier}`} color={m.color} bg={m.bg} />
                <span style={{ fontSize:12, fontWeight:700,
                  color: tier === ME.tier ? "#10b981" : "#aaa" }}>
                  {m.rate}% {tier === ME.tier ? "← you" : ""}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Recent commissions */}
      <Card>
        <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16 }}>
          Recent commissions
        </p>
        {COMMISSIONS.slice(0, 5).map((c, i) => (
          <div key={c.id} style={{ display:"flex", alignItems:"center", gap:14,
            padding:"11px 0",
            borderBottom:i<4?"1px solid #f5f5ff":"none" }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600, fontSize:13, color:DARK, marginBottom:2 }}>
                {c.product}
              </p>
              <p style={{ fontSize:11, color:"#aaa" }}>{c.buyer} · {c.date}</p>
            </div>
            <div style={{ textAlign:"right", marginRight:10 }}>
              <p style={{ fontWeight:700, fontSize:14, color:"#10b981", marginBottom:2 }}>
                +${c.comm.toFixed(2)}
              </p>
              <p style={{ fontSize:11, color:"#aaa" }}>Sale: ${c.sale}</p>
            </div>
            <Pill label={c.status}
              color={STATUS_STYLE[c.status].color}
              bg={STATUS_STYLE[c.status].bg} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── View: My Links ───────────────────────────────────────────────────────────
function MyLinks() {
  const [links, setLinks] = useState(MY_LINKS);
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");

  const add = () => {
    if (!label.trim()) return;
    setLinks(l => [...l, {
      id: Date.now(), label, slug: target,
      clicks:0, conversions:0, earned:0
    }]);
    setLabel("");
  };

  return (
    <div>
      <SectionHead
        title="My Referral Links"
        sub={`All links earn your ${TIER_META[ME.tier].rate}% commission. Create custom ones for campaigns or products.`}
      />

      {/* Code banner */}
      <div style={{ background:`linear-gradient(135deg,${P},#4f46e5)`,
        borderRadius:14, padding:"18px 22px", marginBottom:22,
        display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:16 }}>
        <div>
          <p style={{ color:"rgba(255,255,255,.6)", fontSize:12, marginBottom:4 }}>
            Universal referral code — works on any page
          </p>
          <p style={{ color:"#fff", fontWeight:900, fontSize:28,
            letterSpacing:".08em" }}>{ME.code}</p>
        </div>
        <CopyBtn text={ME.code} label="Copy code" />
      </div>

      {/* Create link */}
      <Card style={{ marginBottom:22 }}>
        <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:12 }}>
          Create a custom link
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <input value={label} onChange={e=>setLabel(e.target.value)}
            placeholder='Label, e.g. "Instagram bio"'
            style={{ flex:1, padding:"9px 14px", border:"1px solid #e0dfee",
              borderRadius:8, fontSize:13, outline:"none" }} />
          <input value={target} onChange={e=>setTarget(e.target.value)}
            placeholder="Product slug (leave blank for homepage)"
            style={{ flex:1, padding:"9px 14px", border:"1px solid #e0dfee",
              borderRadius:8, fontSize:13, outline:"none" }} />
          <button onClick={add}
            style={{ background:P, color:"#fff", border:"none",
              borderRadius:8, padding:"9px 18px",
              fontSize:13, fontWeight:700, cursor:"pointer" }}>
            + Create
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #f0eeff" }}>
              {["Label","Full URL","Clicks","Sales","Earned",""].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 10px",
                  fontSize:11, fontWeight:700, color:"#aaa",
                  textTransform:"uppercase", letterSpacing:".05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map(l => (
              <tr key={l.id} style={{ borderBottom:"1px solid #f9f8ff" }}>
                <td style={{ padding:"12px 10px", fontWeight:700, color:DARK }}>
                  {l.label}
                </td>
                <td style={{ padding:"12px 10px" }}>
                  <span style={{ fontSize:11, color:"#888", background:"#f5f5f5",
                    padding:"3px 8px", borderRadius:6, fontFamily:"monospace" }}>
                    {buildUrl(l.slug).substring(0, 42)}…
                  </span>
                </td>
                <td style={{ padding:"12px 10px", fontWeight:600, color:"#555" }}>
                  {l.clicks.toLocaleString()}
                </td>
                <td style={{ padding:"12px 10px", fontWeight:600, color:"#555" }}>
                  {l.conversions}
                </td>
                <td style={{ padding:"12px 10px", fontWeight:700, color:"#10b981" }}>
                  ${l.earned.toLocaleString()}
                </td>
                <td style={{ padding:"12px 10px" }}>
                  <CopyBtn text={buildUrl(l.slug)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── View: Commissions ────────────────────────────────────────────────────────
function Commissions() {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all"
    ? COMMISSIONS
    : COMMISSIONS.filter(c => c.status === filter);

  const cleared = COMMISSIONS.filter(c=>c.status==="cleared").reduce((s,c)=>s+c.comm,0);
  const pending = COMMISSIONS.filter(c=>c.status==="pending").reduce((s,c)=>s+c.comm,0);

  return (
    <div>
      <SectionHead title="Commission History"
        sub="Every sale tracked through your referral links." />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
        gap:14, marginBottom:22 }}>
        <StatCard label="Cleared this month"
          value={`$${cleared.toFixed(2)}`} icon="✅" valueColor="#10b981" />
        <StatCard label="Pending clearance"
          value={`$${pending.toFixed(2)}`} icon="⏳" />
        <StatCard label="Avg. per sale"
          value={`$${(ME.totalEarned / 211).toFixed(2)}`} icon="📊" valueColor={P} />
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["all","All"],["cleared","Cleared"],["pending","Pending"]].map(([val,lbl]) => (
          <button key={val} onClick={()=>setFilter(val)}
            style={{ padding:"7px 16px", borderRadius:999,
              border:`1.5px solid ${filter===val?P:"#e0dfee"}`,
              background:filter===val?P:"#fff",
              color:filter===val?"#fff":"#555",
              fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {lbl}
          </button>
        ))}
      </div>

      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #f0eeff" }}>
              {["Ref","Product","Buyer","Sale","Commission","Date","Status"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px",
                  fontSize:11, fontWeight:700, color:"#aaa",
                  textTransform:"uppercase", letterSpacing:".05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((c, i) => (
              <tr key={c.id}
                style={{ borderBottom:"1px solid #f9f8ff",
                  background:i%2===0?"#fff":"#fefeff" }}>
                <td style={{ padding:"11px 12px" }}>
                  <code style={{ fontSize:11, background:"#f5f5f5",
                    padding:"2px 7px", borderRadius:4 }}>{c.id}</code>
                </td>
                <td style={{ padding:"11px 12px", fontWeight:600, color:DARK }}>
                  {c.product}
                </td>
                <td style={{ padding:"11px 12px", color:"#888" }}>{c.buyer}</td>
                <td style={{ padding:"11px 12px", color:"#555" }}>${c.sale}</td>
                <td style={{ padding:"11px 12px", fontWeight:700, color:"#10b981" }}>
                  +${c.comm.toFixed(2)}
                </td>
                <td style={{ padding:"11px 12px", color:"#aaa" }}>{c.date}</td>
                <td style={{ padding:"11px 12px" }}>
                  <Pill label={c.status}
                    color={STATUS_STYLE[c.status].color}
                    bg={STATUS_STYLE[c.status].bg} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── View: Payouts ────────────────────────────────────────────────────────────
function Payouts() {
  const [requested, setRequested] = useState(false);
  const [method, setMethod]       = useState("paystack");
  const [amount, setAmount]       = useState(ME.balance.toFixed(2));

  return (
    <div>
      <SectionHead title="Payouts"
        sub="Request withdrawals and track your payout history." />

      {/* Balance strip */}
      <div style={{ background:`linear-gradient(135deg,${DARK},#1a0e5c)`,
        borderRadius:16, padding:"22px 28px", marginBottom:22 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          gap:20, marginBottom:16 }}>
          {[["Available balance",`$${ME.balance.toFixed(2)}`,P],
            ["Total earned",`$${ME.totalEarned.toLocaleString()}`,"#a78bfa"],
            ["Total paid out",`$${ME.totalPaid.toFixed(2)}`,"#10b981"]].map(([l,v,c]) => (
            <div key={l}>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:11, marginBottom:4 }}>{l}</p>
              <p style={{ color:c, fontSize:22, fontWeight:900 }}>{v}</p>
            </div>
          ))}
        </div>
        <p style={{ color:"rgba(255,255,255,.35)", fontSize:11 }}>
          Minimum payout: $20 · Processed every Thursday
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Request form */}
        <Card>
          <p style={{ fontWeight:700, fontSize:15, color:DARK, marginBottom:14 }}>
            Request a payout
          </p>
          {requested ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <p style={{ fontSize:40, marginBottom:10 }}>✅</p>
              <p style={{ fontWeight:700, fontSize:15, color:DARK, marginBottom:6 }}>
                Payout requested!
              </p>
              <p style={{ fontSize:13, color:"#888" }}>
                ${parseFloat(amount).toFixed(2)} via{" "}
                {method === "paystack" ? "Paystack (NGN)" : "Stripe (USD)"} by{" "}
                {ME.nextPayout}.
              </p>
              <button onClick={() => setRequested(false)}
                style={{ marginTop:16, background:"#f5f5f5", border:"none",
                  borderRadius:8, padding:"8px 18px",
                  fontSize:13, cursor:"pointer", color:"#555" }}>
                Done
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"#888", display:"block",
                  marginBottom:4, fontWeight:600 }}>Amount (USD)</label>
                <input type="number" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  max={ME.balance}
                  style={{ width:"100%", padding:"10px 14px",
                    border:"1px solid #e0dfee", borderRadius:8,
                    fontSize:16, fontWeight:700, outline:"none" }} />
                <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>
                  Available: ${ME.balance.toFixed(2)}
                </p>
              </div>

              <div>
                <label style={{ fontSize:12, color:"#888", display:"block",
                  marginBottom:8, fontWeight:600 }}>Payout method</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[["paystack","Paystack (NGN)","Instant to Nigerian bank"],
                    ["stripe","Stripe (USD)","2–3 business days"]].map(([val,name,sub]) => (
                    <label key={val} onClick={() => setMethod(val)}
                      style={{ display:"flex", alignItems:"center", gap:10,
                        padding:"10px 14px",
                        border:`1.5px solid ${method===val?P:"#e0dfee"}`,
                        borderRadius:10, cursor:"pointer",
                        background:method===val?"#EEEDFE":"#fff" }}>
                      <div style={{ width:16, height:16, borderRadius:"50%",
                        border:`2px solid ${method===val?P:"#ccc"}`,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {method===val && (
                          <div style={{ width:8, height:8, borderRadius:"50%",
                            background:P }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:700, color:DARK }}>{name}</p>
                        <p style={{ fontSize:11, color:"#aaa" }}>{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={() => setRequested(true)}
                disabled={parseFloat(amount) < 20}
                style={{ background:parseFloat(amount)>=20?P:"#ccc",
                  color:"#fff", border:"none", borderRadius:8,
                  padding:"11px", fontSize:13, fontWeight:700,
                  cursor:parseFloat(amount)>=20?"pointer":"not-allowed" }}>
                Request ${parseFloat(amount)||0} payout
              </button>
            </div>
          )}
        </Card>

        {/* History */}
        <Card>
          <p style={{ fontWeight:700, fontSize:15, color:DARK, marginBottom:14 }}>
            Payout history
          </p>
          {PAYOUTS.map((p, i) => (
            <div key={p.id}
              style={{ display:"flex", alignItems:"center", gap:12,
                padding:"11px 0",
                borderBottom:i<PAYOUTS.length-1?"1px solid #f5f5ff":"none" }}>
              <div style={{ width:40, height:40, borderRadius:10,
                background:"#EEEDFE", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:20, flexShrink:0 }}>💳</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:13, color:DARK, marginBottom:1 }}>
                  {p.method} payout
                </p>
                <p style={{ fontSize:11, color:"#aaa" }}>
                  {p.date} ·{" "}
                  <code style={{ fontSize:10 }}>{p.id}</code>
                </p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontWeight:700, fontSize:14,
                  color:"#10b981", marginBottom:4 }}>
                  ${p.amount.toFixed(2)}
                </p>
                <Pill label={p.status}
                  color={STATUS_STYLE[p.status].color}
                  bg={STATUS_STYLE[p.status].bg} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── View: Promote ────────────────────────────────────────────────────────────
function Promote() {
  const [copied, setCopied] = useState(null);
  const rate = TIER_META[ME.tier].rate;

  const copy = (id, slug) => {
    navigator.clipboard?.writeText(buildUrl(slug)).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <SectionHead title="Products to Promote"
        sub={`Pick any product, grab your link and earn ${rate}% on every sale.`} />

      {/* Marketing kit */}
      <div style={{ background:"linear-gradient(135deg,#EEEDFE,#f5f3ff)",
        border:"1px solid #c4c0f5", borderRadius:14,
        padding:"18px 22px", marginBottom:22,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:4 }}>
            📦 Marketing kit
          </p>
          <p style={{ fontSize:13, color:"#666" }}>
            Banners, email templates, and captions for every product.
          </p>
        </div>
        <button style={{ background:P, color:"#fff", border:"none",
          borderRadius:8, padding:"9px 18px",
          fontSize:13, fontWeight:700, cursor:"pointer", flexShrink:0 }}>
          Download kit
        </button>
      </div>

      <div style={{ display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:16 }}>
        {PROMOTABLE.map(p => (
          <Card key={p.id} style={{ padding:0, overflow:"hidden" }}>
            <div style={{ height:110, background:`linear-gradient(135deg,${P},#4f46e5)`,
              display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:40 }}>
              {p.cover}
            </div>
            <div style={{ padding:14 }}>
              <p style={{ fontWeight:700, fontSize:13, color:DARK,
                lineHeight:1.35, marginBottom:4 }}>{p.name}</p>
              <p style={{ fontSize:11, color:"#aaa", marginBottom:10 }}>
                by {p.vendor} · ⭐ {p.rating}
              </p>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:12 }}>
                <span style={{ fontWeight:900, color:DARK, fontSize:16 }}>
                  ${p.price}
                </span>
                <span style={{ fontSize:12, fontWeight:700, color:"#10b981",
                  background:"#d1fae5", padding:"2px 8px", borderRadius:999 }}>
                  Earn ${(p.price * rate / 100).toFixed(2)}
                </span>
              </div>
              <button onClick={() => copy(p.id, p.name.toLowerCase().replace(/\s+/g,"-"))}
                style={{ width:"100%",
                  background:copied===p.id?"#10b981":P,
                  color:"#fff", border:"none", borderRadius:8,
                  padding:"8px", fontSize:12, fontWeight:700,
                  cursor:"pointer", transition:"background .2s" }}>
                {copied===p.id ? "✓ Link copied!" : "Copy affiliate link"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── View: Leaderboard ────────────────────────────────────────────────────────
function Leaderboard() {
  return (
    <div>
      <SectionHead title="Leaderboard"
        sub="Where you rank against other affiliates this month." />

      {/* My rank callout */}
      <div style={{ background:`linear-gradient(135deg,${DARK},#1a0e5c)`,
        borderRadius:14, padding:"20px 24px", marginBottom:22,
        display:"flex", alignItems:"center", gap:18 }}>
        <div style={{ width:56, height:56, borderRadius:"50%",
          background:"linear-gradient(135deg,#fbbf24,#f59e0b)",
          display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:28, flexShrink:0 }}>🥇</div>
        <div style={{ flex:1 }}>
          <p style={{ color:"rgba(255,255,255,.45)", fontSize:12, marginBottom:3 }}>
            Your current rank
          </p>
          <p style={{ color:"#fff", fontWeight:900, fontSize:20, marginBottom:2 }}>
            #1 — {ME.name}
          </p>
          <p style={{ color:"#a78bfa", fontSize:13 }}>
            211 sales · ${ME.totalEarned.toLocaleString()} earned this month
          </p>
        </div>
        <Pill label={ME.tier}
          color={TIER_META[ME.tier].color}
          bg={TIER_META[ME.tier].bg} />
      </div>

      <Card>
        {LEADERBOARD.map((a, i) => {
          const tm = TIER_META[a.tier];
          const medal = ["🥇","🥈","🥉"][a.rank-1];
          return (
            <div key={a.rank}
              style={{ display:"flex", alignItems:"center", gap:14,
                padding:"13px 10px",
                borderBottom:i<LEADERBOARD.length-1?"1px solid #f5f5ff":"none",
                background:a.isMe?"#EEEDFE":"transparent",
                borderRadius:a.isMe?10:0,
                margin:a.isMe?"4px -10px":0,
                paddingLeft:a.isMe?20:10, paddingRight:a.isMe?20:10 }}>

              <div style={{ width:36, height:36, borderRadius:"50%",
                background:a.rank<=3
                  ?"linear-gradient(135deg,#fbbf24,#f59e0b)":"#f0f0f0",
                display:"flex", alignItems:"center",
                justifyContent:"center",
                fontWeight:900, fontSize:a.rank<=3?20:14,
                color:a.rank<=3?"#fff":"#888", flexShrink:0 }}>
                {a.rank<=3 ? medal : `#${a.rank}`}
              </div>

              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center",
                  gap:8, marginBottom:2 }}>
                  <p style={{ fontWeight:700, fontSize:14, color:DARK }}>
                    {a.name}
                  </p>
                  {a.isMe && <Pill label="You" color={P} bg="#EEEDFE" />}
                </div>
                <p style={{ fontSize:11, color:"#aaa" }}>
                  Code:{" "}
                  <code style={{ fontSize:10 }}>{a.code}</code>
                </p>
              </div>

              <div style={{ textAlign:"right", marginRight:12 }}>
                <p style={{ fontWeight:700, fontSize:14,
                  color:"#10b981", marginBottom:2 }}>
                  ${a.earned.toLocaleString()}
                </p>
                <p style={{ fontSize:11, color:"#aaa" }}>{a.sales} sales</p>
              </div>

              <Pill label={`${tm.icon} ${a.tier}`} color={tm.color} bg={tm.bg} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── View: Settings ───────────────────────────────────────────────────────────
function Settings() {
  const [form, setForm] = useState({
    displayName:       ME.name,
    email:             ME.email,
    paystackEmail:     ME.email,
    stripeEmail:       "",
    notifySale:        true,
    notifyPayout:      true,
    notifyTier:        true,
    notifyWeeklyReport:false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <SectionHead title="Account Settings"
        sub="Manage your profile, payout methods, and notifications." />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <Card style={{ marginBottom:16 }}>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Profile
            </p>
            {[["Display name","displayName","text"],
              ["Email address","email","email"]].map(([lbl,key,type]) => (
              <div key={key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:"#888", display:"block",
                  marginBottom:4, fontWeight:600 }}>{lbl}</label>
                <input type={type} value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  style={{ width:"100%", padding:"9px 12px",
                    border:"1px solid #e0dfee", borderRadius:8,
                    fontSize:13, outline:"none" }} />
              </div>
            ))}
            <button style={{ background:P, color:"#fff", border:"none",
              borderRadius:8, padding:"9px 18px",
              fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Save profile
            </button>
          </Card>

          <Card>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Payout methods
            </p>
            {[["Paystack (NGN) — Primary","paystackEmail","Instant to Nigerian bank"],
              ["Stripe (USD)","stripeEmail","2–3 business days"]].map(([lbl,key,sub]) => (
              <div key={key} style={{ marginBottom:14, padding:"12px 14px",
                background:"#f8f7ff", borderRadius:10 }}>
                <p style={{ fontWeight:700, fontSize:13, color:DARK, marginBottom:5 }}>
                  {lbl}
                </p>
                <input value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder="Email connected to account"
                  style={{ width:"100%", padding:"8px 12px",
                    border:"1px solid #e0dfee", borderRadius:8,
                    fontSize:13, outline:"none", marginBottom:5 }} />
                <p style={{ fontSize:11, color:"#aaa" }}>{sub}</p>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom:16 }}>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Notifications
            </p>
            {[["notifySale",   "New sale via my link"],
              ["notifyPayout", "Payout processed"],
              ["notifyTier",   "Tier upgrade achieved"],
              ["notifyWeeklyReport","Weekly performance report"]].map(([k,lbl]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"10px 0",
                borderBottom:"1px solid #f9f8ff" }}>
                <p style={{ fontSize:13, color:"#555" }}>{lbl}</p>
                <Toggle on={form[k]} onChange={v => set(k, v)} />
              </div>
            ))}
          </Card>

          <Card>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Your affiliate info
            </p>
            {[["Referral code", ME.code],
              ["Commission rate", `${TIER_META[ME.tier].rate}%`],
              ["Current tier",   ME.tier],
              ["Member since",   ME.joined]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between",
                padding:"10px 0", borderBottom:"1px solid #f9f8ff" }}>
                <span style={{ fontSize:13, color:"#888" }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:DARK }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  ["overview",    "📊", "Overview"],
  ["links",       "🔗", "My Links"],
  ["commissions", "💸", "Commissions"],
  ["payouts",     "💳", "Payouts"],
  ["promote",     "📣", "Promote"],
  ["leaderboard", "🏆", "Leaderboard"],
  ["settings",    "⚙️", "Settings"],
];

export default function AffiliateDashboard({ onExit }) {
  const [tab, setTab] = useState("overview");
  const tm = TIER_META[ME.tier];

  const VIEWS = {
    overview:    <Overview />,
    links:       <MyLinks />,
    commissions: <Commissions />,
    payouts:     <Payouts />,
    promote:     <Promote />,
    leaderboard: <Leaderboard />,
    settings:    <Settings />,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width:210, background:DARK, display:"flex",
        flexDirection:"column", padding:"20px 0",
        position:"fixed", top:0, left:0, bottom:0, zIndex:50 }}>

        <div style={{ padding:"0 16px 18px",
          borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          {onExit && (
            <button onClick={onExit}
              style={{ background:"none", border:"none",
                color:"rgba(255,255,255,.3)", fontSize:11,
                cursor:"pointer", marginBottom:10, padding:0 }}>
              ← Back to store
            </button>
          )}
          <p style={{ color:"#fff", fontWeight:800, fontSize:15, marginBottom:2 }}>
            📦 SocialSell
          </p>
          <p style={{ color:"rgba(255,255,255,.3)", fontSize:11, marginBottom:14 }}>
            Affiliate Dashboard
          </p>

          {/* Identity card */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%",
              background:P, display:"flex", alignItems:"center",
              justifyContent:"center", color:"#fff",
              fontWeight:800, fontSize:14, flexShrink:0 }}>
              {ME.name[0]}
            </div>
            <div>
              <p style={{ color:"#fff", fontWeight:700, fontSize:13,
                marginBottom:3 }}>{ME.name}</p>
              <Pill label={`${tm.icon} ${ME.tier}`} color={tm.color} bg={tm.bg} />
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:"12px 8px",
          display:"flex", flexDirection:"column", gap:2 }}>
          {NAV_ITEMS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", borderRadius:8, border:"none",
                background:tab===id?"rgba(108,99,255,.22)":"transparent",
                color:tab===id?"#a78bfa":"rgba(255,255,255,.45)",
                fontSize:13, fontWeight:tab===id?700:400,
                textAlign:"left", cursor:"pointer", transition:"all .15s" }}>
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Balance chip */}
        <div style={{ padding:"14px 16px",
          borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <p style={{ color:"rgba(255,255,255,.3)", fontSize:11, marginBottom:3 }}>
            Available balance
          </p>
          <p style={{ color:"#10b981", fontWeight:900, fontSize:20 }}>
            ${ME.balance.toFixed(2)}
          </p>
          <p style={{ color:"rgba(255,255,255,.25)", fontSize:10, marginTop:2 }}>
            Next payout: {ME.nextPayout}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:210, flex:1,
        background:"#f8f7ff", padding:"32px 36px", overflowY:"auto" }}>
        {VIEWS[tab]}
      </main>
    </div>
  );
}

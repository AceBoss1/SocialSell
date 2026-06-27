// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/components/SuperAdmin.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

// ─── Mock data (replace with supabase queries in production) ──────────────────
const MOCK_VENDORS = [
  { id:1, name:"DesignLab", email:"hello@designlab.io", products:31, revenue:91500, payout:86925, fee:4575, orders:1203, rating:4.9, status:"active", joined:"Mar 2023", country:"🇺🇸", plan:"pro", stripeConnected:true },
  { id:2, name:"AICreators", email:"team@aicreators.co", products:19, revenue:124000, payout:117800, fee:6200, orders:3100, rating:4.9, status:"active", joined:"Nov 2023", country:"🇳🇬", plan:"pro", stripeConnected:false, paystackConnected:true },
  { id:3, name:"CreatorHub", email:"info@creatorhub.com", products:12, revenue:48200, payout:45790, fee:2410, orders:642, rating:4.8, status:"active", joined:"Jan 2024", country:"🇬🇧", plan:"pro", stripeConnected:true },
  { id:4, name:"BeatMaker",  email:"beats@bm.studio", products:8, revenue:22100, payout:20995, fee:1105, orders:298, rating:4.8, status:"active", joined:"Jun 2024", country:"🇬🇭", plan:"starter", stripeConnected:false, paystackConnected:true },
  { id:5, name:"GrowthLab",  email:"growth@lab.io", products:5, revenue:38900, payout:36955, fee:1945, orders:521, rating:4.7, status:"suspended", joined:"Sep 2023", country:"🇩🇪", plan:"pro", stripeConnected:true },
  { id:6, name:"VideoKit",   email:"kit@video.dev", products:22, revenue:57300, payout:54435, fee:2865, orders:812, rating:4.7, status:"pending_review", joined:"Feb 2024", country:"🇿🇦", plan:"pro", stripeConnected:true },
];

const MOCK_ORDERS = [
  { id:"ORD-9901", buyer:"Ada Okonkwo", product:"AI Prompt Bible", vendor:"AICreators", amount:39, currency:"NGN", provider:"paystack", status:"paid", date:"Jun 22" },
  { id:"ORD-9900", buyer:"Carlos Rivera", product:"Brand Identity Kit", vendor:"DesignLab", amount:59, currency:"USD", provider:"stripe", status:"paid", date:"Jun 22" },
  { id:"ORD-9899", buyer:"Priya Nair", product:"Social Media Masterclass", vendor:"CreatorHub", amount:79, currency:"USD", provider:"stripe", status:"paid", date:"Jun 21" },
  { id:"ORD-9898", buyer:"James Owusu", product:"Beat Collection Vol. 1", vendor:"BeatMaker", amount:45, currency:"GHS", provider:"paystack", status:"refunded", date:"Jun 21" },
  { id:"ORD-9897", buyer:"Sofia Müller", product:"TikTok Template Pack", vendor:"DesignLab", amount:29, currency:"EUR", provider:"stripe", status:"paid", date:"Jun 20" },
  { id:"ORD-9896", buyer:"Kwame Asante", product:"SEO Playbook 2025", vendor:"GrowthLab", amount:19, currency:"GHS", provider:"paystack", status:"disputed", date:"Jun 20" },
];

const MOCK_PAYOUTS = [
  { id:"PAY-041", vendor:"DesignLab", amount:4312.50, currency:"USD", provider:"stripe", status:"completed", date:"Jun 21" },
  { id:"PAY-040", vendor:"AICreators", amount:8940, currency:"NGN", provider:"paystack", status:"processing", date:"Jun 21" },
  { id:"PAY-039", vendor:"CreatorHub", amount:2180, currency:"GBP", provider:"stripe", status:"pending", date:"Jun 22" },
  { id:"PAY-038", vendor:"VideoKit", amount:3100, currency:"USD", provider:"stripe", status:"completed", date:"Jun 18" },
];

const MOCK_FLAGS = [
  { id:1, type:"DMCA", vendor:"DesignLab", product:"Social Media Template Pack", reporter:"Anonymous", date:"Jun 20", status:"open" },
  { id:2, type:"Spam", vendor:"GrowthLab", product:"SEO Playbook 2025", reporter:"user_12984", date:"Jun 19", status:"resolved" },
  { id:3, type:"Fraud", vendor:"AICreators", product:"AI Prompt Bible", reporter:"system", date:"Jun 18", status:"investigating" },
];

const REVENUE_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun"];
const PLATFORM_REV   = [41200,57800,49600,78400,66100,99800];
const PLATFORM_FEE   = [2060,2890,2480,3920,3305,4990];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const P = "#6C63FF", DARK = "#0c0b2e";

const fmt = (n, cur = "USD") => {
  const syms = { USD:"$", NGN:"₦", EUR:"€", GBP:"£", GHS:"₵", KES:"KSh" };
  return `${syms[cur] || ""}${Number(n).toLocaleString()}`;
};

function Badge({ label, color, bg }) {
  return <span style={{ fontSize:11, fontWeight:700, color, background:bg, padding:"2px 9px", borderRadius:999 }}>{label}</span>;
}

const STATUS_BADGE = {
  active:         <Badge label="Active"         color="#065F46" bg="#D1FAE5" />,
  suspended:      <Badge label="Suspended"      color="#991B1B" bg="#FEE2E2" />,
  pending_review: <Badge label="Under review"   color="#92400E" bg="#FEF3C7" />,
  paid:           <Badge label="Paid"           color="#065F46" bg="#D1FAE5" />,
  refunded:       <Badge label="Refunded"       color="#6B7280" bg="#F3F4F6" />,
  disputed:       <Badge label="Disputed"       color="#991B1B" bg="#FEE2E2" />,
  completed:      <Badge label="Completed"      color="#065F46" bg="#D1FAE5" />,
  processing:     <Badge label="Processing"     color="#1D4ED8" bg="#DBEAFE" />,
  pending:        <Badge label="Pending"        color="#92400E" bg="#FEF3C7" />,
  open:           <Badge label="Open"           color="#991B1B" bg="#FEE2E2" />,
  resolved:       <Badge label="Resolved"       color="#065F46" bg="#D1FAE5" />,
  investigating:  <Badge label="Investigating"  color="#92400E" bg="#FEF3C7" />,
};

function MiniBar({ pct, color = P }) {
  return (
    <div style={{ background:"#f1effe", borderRadius:4, height:7, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:4 }} />
    </div>
  );
}

function BarChart({ data, labels, color = P, feeData }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:140 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <div style={{ width:"100%", position:"relative" }}>
            <div style={{ width:"100%", background:color, borderRadius:"4px 4px 0 0", height:`${(v/max)*120}px` }} />
            {feeData && (
              <div title={`Platform fee: $${feeData[i].toLocaleString()}`} style={{ position:"absolute", bottom:0, width:"100%", background:"#10b981", borderRadius:"4px 4px 0 0", height:`${(feeData[i]/max)*120}px` }} />
            )}
          </div>
          <span style={{ fontSize:9, color:"#aaa" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = "#0f0e2a", icon }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <p style={{ fontSize:12, color:"#aaa", fontWeight:600 }}>{label}</p>
        {icon && <span style={{ fontSize:20 }}>{icon}</span>}
      </div>
      <p style={{ fontSize:26, fontWeight:900, color, marginBottom:4 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:"#10b981", fontWeight:600 }}>{sub}</p>}
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function TabOverview() {
  const totalRev  = MOCK_VENDORS.reduce((s, v) => s + v.revenue, 0);
  const totalFee  = MOCK_VENDORS.reduce((s, v) => s + v.fee, 0);
  const totalOrds = MOCK_VENDORS.reduce((s, v) => s + v.orders, 0);
  const activeV   = MOCK_VENDORS.filter(v => v.status === "active").length;

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:26 }}>
        <StatCard label="Gross Platform Revenue" value={fmt(totalRev)} sub="+31% vs last month" icon="💰" />
        <StatCard label="Platform Fee Earned"    value={fmt(totalFee)} sub="+31% vs last month" color="#6C63FF" icon="🏦" />
        <StatCard label="Total Orders"           value={totalOrds.toLocaleString()} sub="+18% vs last month" icon="🛍️" />
        <StatCard label="Active Vendors"         value={`${activeV} / ${MOCK_VENDORS.length}`} sub="2 need review" icon="🏪" />
      </div>

      {/* Revenue chart + breakdown */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <p style={{ fontWeight:700, fontSize:14, color:DARK }}>Platform revenue vs fee — 6 months</p>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#555" }}><span style={{ width:10, height:10, borderRadius:2, background:P, display:"inline-block" }} /> GMV</span>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#555" }}><span style={{ width:10, height:10, borderRadius:2, background:"#10b981", display:"inline-block" }} /> Fee</span>
            </div>
          </div>
          <BarChart data={PLATFORM_REV} labels={REVENUE_MONTHS} color={P} feeData={PLATFORM_FEE} />
        </div>

        <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:22 }}>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16 }}>Revenue by vendor</p>
          {MOCK_VENDORS.filter(v=>v.status==="active").sort((a,b)=>b.revenue-a.revenue).map(v => (
            <div key={v.id} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:"#555" }}>{v.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color:DARK }}>{fmt(v.revenue)}</span>
              </div>
              <MiniBar pct={(v.revenue / 124000) * 100} color={P} />
            </div>
          ))}
        </div>
      </div>

      {/* Payment split + platform health */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:22 }}>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16 }}>Payment provider split</p>
          {[["Stripe","63%","#635BFF"],["Paystack","37%","#00C3F7"]].map(([name,pct,c]) => (
            <div key={name} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, color:"#555" }}>{name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:DARK }}>{pct}</span>
              </div>
              <MiniBar pct={parseInt(pct)} color={c} />
            </div>
          ))}
          <div style={{ marginTop:16, padding:"12px 14px", background:"#f8f7ff", borderRadius:8 }}>
            <p style={{ fontSize:12, color:"#888", marginBottom:4 }}>Next payout batch</p>
            <p style={{ fontSize:15, fontWeight:700, color:DARK }}>Thursday, Jun 27 — <span style={{ color:"#10b981" }}>$14,820</span></p>
          </div>
        </div>

        <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:22 }}>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16 }}>Platform health</p>
          {[["API Uptime","99.97%","#10b981"],["Stripe Webhook","Healthy","#10b981"],["Paystack Webhook","Healthy","#10b981"],["DB Performance","Excellent","#6C63FF"],["Cloudinary CDN","Healthy","#10b981"],["Scheduled Jobs","3 pending","#f59e0b"]].map(([l,v,c]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f9f8ff" }}>
              <span style={{ fontSize:13, color:"#555" }}>{l}</span>
              <span style={{ fontSize:13, fontWeight:700, color:c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Vendors ─────────────────────────────────────────────────────────────
function TabVendors() {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? MOCK_VENDORS : MOCK_VENDORS.filter(v => v.status === filter);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        {[["all","All"],["active","Active"],["pending_review","Under review"],["suspended","Suspended"]].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding:"7px 16px", borderRadius:999, border:`1.5px solid ${filter===val?P:"#e0dfee"}`, background:filter===val?P:"#fff", color:filter===val?"#fff":"#555", fontSize:12, fontWeight:600, cursor:"pointer" }}>{label}</button>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9f8ff", borderBottom:"1px solid #ededf5" }}>
              {["Vendor","Country","Plan","Products","Orders","GMV","Platform Fee","Status","Payments","Actions"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((v, i) => (
              <tr key={v.id} style={{ borderBottom:"1px solid #f5f5ff", background: i%2===0 ? "#fff" : "#fefeff" }}>
                <td style={{ padding:"12px 14px" }}>
                  <p style={{ fontWeight:700, color:DARK, marginBottom:1 }}>{v.name}</p>
                  <p style={{ fontSize:11, color:"#aaa" }}>{v.email}</p>
                </td>
                <td style={{ padding:"12px 14px" }}>{v.country}</td>
                <td style={{ padding:"12px 14px" }}>
                  <Badge label={v.plan.toUpperCase()} color={v.plan==="pro"?P:"#555"} bg={v.plan==="pro"?"#EEEDFE":"#f0f0f0"} />
                </td>
                <td style={{ padding:"12px 14px", color:"#555" }}>{v.products}</td>
                <td style={{ padding:"12px 14px", color:"#555" }}>{v.orders.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", fontWeight:700, color:"#10b981" }}>{fmt(v.revenue)}</td>
                <td style={{ padding:"12px 14px", fontWeight:700, color:P }}>{fmt(v.fee)}</td>
                <td style={{ padding:"12px 14px" }}>{STATUS_BADGE[v.status]}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {v.stripeConnected && <Badge label="Stripe ✓" color="#635BFF" bg="#F0EEFF" />}
                    {v.paystackConnected && <Badge label="Paystack ✓" color="#00C3F7" bg="#E5FAFF" />}
                  </div>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    <button style={{ fontSize:11, padding:"4px 10px", border:`1px solid ${P}`, borderRadius:6, color:P, background:"#fff", cursor:"pointer" }}>View</button>
                    {v.status === "active" && <button style={{ fontSize:11, padding:"4px 10px", border:"1px solid #ef4444", borderRadius:6, color:"#ef4444", background:"#fff", cursor:"pointer" }}>Suspend</button>}
                    {v.status === "pending_review" && <button style={{ fontSize:11, padding:"4px 10px", border:"1px solid #10b981", borderRadius:6, color:"#10b981", background:"#fff", cursor:"pointer" }}>Approve</button>}
                    {v.status === "suspended" && <button style={{ fontSize:11, padding:"4px 10px", border:"1px solid #10b981", borderRadius:6, color:"#10b981", background:"#fff", cursor:"pointer" }}>Reinstate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────
function TabOrders() {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);
  const PROVIDER_BADGE = {
    stripe:   <Badge label="Stripe"   color="#635BFF" bg="#F0EEFF" />,
    paystack: <Badge label="Paystack" color="#00C3F7" bg="#E5FAFF" />,
  };
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        {[["all","All"],["paid","Paid"],["refunded","Refunded"],["disputed","Disputed"]].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding:"7px 16px", borderRadius:999, border:`1.5px solid ${filter===val?P:"#e0dfee"}`, background:filter===val?P:"#fff", color:filter===val?"#fff":"#555", fontSize:12, fontWeight:600, cursor:"pointer" }}>{label}</button>
        ))}
      </div>
      <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9f8ff", borderBottom:"1px solid #ededf5" }}>
              {["Order ID","Buyer","Product","Vendor","Amount","Currency","Provider","Status","Date"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((o, i) => (
              <tr key={o.id} style={{ borderBottom:"1px solid #f5f5ff", background: i%2===0?"#fff":"#fefeff" }}>
                <td style={{ padding:"11px 14px" }}><code style={{ fontSize:11, background:"#f5f5f5", padding:"2px 7px", borderRadius:4 }}>{o.id}</code></td>
                <td style={{ padding:"11px 14px", color:DARK, fontWeight:600 }}>{o.buyer}</td>
                <td style={{ padding:"11px 14px", color:"#555" }}>{o.product}</td>
                <td style={{ padding:"11px 14px", color:"#555" }}>{o.vendor}</td>
                <td style={{ padding:"11px 14px", fontWeight:700, color:"#10b981" }}>${o.amount}</td>
                <td style={{ padding:"11px 14px" }}><Badge label={o.currency} color="#555" bg="#f5f5f5" /></td>
                <td style={{ padding:"11px 14px" }}>{PROVIDER_BADGE[o.provider]}</td>
                <td style={{ padding:"11px 14px" }}>{STATUS_BADGE[o.status]}</td>
                <td style={{ padding:"11px 14px", color:"#aaa" }}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Payouts ─────────────────────────────────────────────────────────────
function TabPayouts() {
  const totalPending = MOCK_PAYOUTS.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <StatCard label="Pending Payouts" value={`$${totalPending.toLocaleString()}`} sub="Due Jun 27" icon="⏳" />
        <StatCard label="Paid Out (June)" value="$18,420" sub="4 vendors" color="#10b981" icon="✅" />
        <StatCard label="Pending Stripe Connect" value="2 vendors" sub="Awaiting verification" icon="⚠️" />
      </div>
      <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid #f0eeff" }}>
          <p style={{ fontWeight:700, fontSize:14, color:DARK }}>Payout queue</p>
          <button style={{ background:P, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Run batch payout</button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9f8ff", borderBottom:"1px solid #ededf5" }}>
              {["Payout ID","Vendor","Amount","Currency","Provider","Status","Date"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYOUTS.map((p, i) => (
              <tr key={p.id} style={{ borderBottom:"1px solid #f5f5ff", background:i%2===0?"#fff":"#fefeff" }}>
                <td style={{ padding:"11px 14px" }}><code style={{ fontSize:11, background:"#f5f5f5", padding:"2px 7px", borderRadius:4 }}>{p.id}</code></td>
                <td style={{ padding:"11px 14px", fontWeight:600, color:DARK }}>{p.vendor}</td>
                <td style={{ padding:"11px 14px", fontWeight:700, color:"#10b981" }}>{p.amount.toLocaleString()}</td>
                <td style={{ padding:"11px 14px" }}><Badge label={p.currency} color="#555" bg="#f5f5f5" /></td>
                <td style={{ padding:"11px 14px" }}>
                  {p.provider === "stripe" ? <Badge label="Stripe" color="#635BFF" bg="#F0EEFF"/> : <Badge label="Paystack" color="#00C3F7" bg="#E5FAFF"/>}
                </td>
                <td style={{ padding:"11px 14px" }}>{STATUS_BADGE[p.status]}</td>
                <td style={{ padding:"11px 14px", color:"#aaa" }}>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Platform Settings ────────────────────────────────────────────────────
function TabSettings() {
  const [settings, setSettings] = useState({
    platform_fee_pct: "5",
    payout_schedule: "weekly",
    min_payout_usd: "20",
    affiliate_base_rate: "10",
    require_product_review: true,
    registration_open: true,
    maintenance_mode: false,
  });

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const Section = ({ title, children }) => (
    <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:22, marginBottom:16 }}>
      <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16, paddingBottom:12, borderBottom:"1px solid #f0eeff" }}>{title}</p>
      {children}
    </div>
  );

  const Row = ({ label, sub, children }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f9f8ff" }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:DARK, marginBottom:2 }}>{label}</p>
        {sub && <p style={{ fontSize:12, color:"#aaa" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width:42, height:24, borderRadius:999, background:value?"#6C63FF":"#ddd", cursor:"pointer", position:"relative", transition:"background .2s" }}>
      <div style={{ position:"absolute", top:3, left:value?20:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <div>
        <Section title="💰 Revenue & Fees">
          <Row label="Platform fee %" sub="% taken from each sale">
            <input type="number" value={settings.platform_fee_pct} onChange={e=>update("platform_fee_pct",e.target.value)} style={{ width:80, padding:"6px 10px", border:"1px solid #e0dfee", borderRadius:8, fontSize:13, textAlign:"right" }} />
          </Row>
          <Row label="Payout schedule" sub="How often vendors receive earnings">
            <select value={settings.payout_schedule} onChange={e=>update("payout_schedule",e.target.value)} style={{ padding:"6px 10px", border:"1px solid #e0dfee", borderRadius:8, fontSize:13, background:"#fff", cursor:"pointer" }}>
              {["daily","weekly","biweekly","monthly"].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </Row>
          <Row label="Minimum payout (USD)" sub="Below this, payout is held">
            <input type="number" value={settings.min_payout_usd} onChange={e=>update("min_payout_usd",e.target.value)} style={{ width:80, padding:"6px 10px", border:"1px solid #e0dfee", borderRadius:8, fontSize:13, textAlign:"right" }} />
          </Row>
          <Row label="Affiliate base rate %" sub="Default commission before tier upgrade">
            <input type="number" value={settings.affiliate_base_rate} onChange={e=>update("affiliate_base_rate",e.target.value)} style={{ width:80, padding:"6px 10px", border:"1px solid #e0dfee", borderRadius:8, fontSize:13, textAlign:"right" }} />
          </Row>
        </Section>

        <Section title="🔐 Platform Controls">
          <Row label="Require product review" sub="New products need admin approval before going live">
            <Toggle value={settings.require_product_review} onChange={v=>update("require_product_review",v)} />
          </Row>
          <Row label="Open registration" sub="Allow new vendors to sign up">
            <Toggle value={settings.registration_open} onChange={v=>update("registration_open",v)} />
          </Row>
          <Row label="Maintenance mode" sub="Take the platform offline for all non-admins">
            <Toggle value={settings.maintenance_mode} onChange={v=>update("maintenance_mode",v)} />
          </Row>
        </Section>
      </div>

      <div>
        <Section title="💳 Payment Providers">
          {[["Stripe","Production","#635BFF"],["Paystack","Production","#00C3F7"]].map(([name,env,c]) => (
            <Row key={name} label={name} sub={`${env} · Webhooks: Healthy`}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
                <span style={{ fontSize:12, color:"#10b981", fontWeight:600 }}>Connected</span>
              </div>
            </Row>
          ))}
          <Row label="Stripe Connect" sub="Vendor payouts via Stripe Connect Express">
            <Badge label="4/6 vendors" color="#635BFF" bg="#F0EEFF" />
          </Row>
          <Row label="Paystack Subaccounts" sub="Split payments for African vendors">
            <Badge label="2/6 vendors" color="#00C3F7" bg="#E5FAFF" />
          </Row>
        </Section>

        <Section title="☁️ Services">
          {[["Cloudinary CDN","Images & files · 4.2GB used","#F97316"],["Supabase DB","Postgres · 98.2MB used","#3ECF8E"],["Supabase Auth","50,000 MAU limit","#3ECF8E"],["Edge Functions","12 deployed · Healthy","#3ECF8E"]].map(([name,sub,c]) => (
            <Row key={name} label={name} sub={sub}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
            </Row>
          ))}
        </Section>

        <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, padding:22 }}>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>⚠️ Danger zone</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button style={{ padding:"9px", border:"1px solid #ef4444", borderRadius:8, color:"#ef4444", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Export all data (GDPR)</button>
            <button style={{ padding:"9px", border:"1px solid #ef4444", borderRadius:8, color:"#ef4444", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Flush cache</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Flags & Moderation ──────────────────────────────────────────────────
function TabFlags() {
  const FLAG_COLOR = { open:"#ef4444", resolved:"#10b981", investigating:"#f59e0b" };
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <StatCard label="Open Flags" value="1" sub="Requires action" icon="🚩" />
        <StatCard label="Investigating" value="1" sub="In progress" icon="🔍" />
        <StatCard label="Resolved (30d)" value="4" sub="Avg. 2.1 days" color="#10b981" icon="✅" />
      </div>
      <div style={{ background:"#fff", border:"1px solid #ededf5", borderRadius:14, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#f9f8ff", borderBottom:"1px solid #ededf5" }}>
              {["Type","Vendor","Product","Reporter","Date","Status","Action"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_FLAGS.map((f, i) => (
              <tr key={f.id} style={{ borderBottom:"1px solid #f5f5ff", background:i%2===0?"#fff":"#fefeff" }}>
                <td style={{ padding:"11px 14px" }}><Badge label={f.type} color={FLAG_COLOR[f.status]} bg={FLAG_COLOR[f.status]+"20"} /></td>
                <td style={{ padding:"11px 14px", fontWeight:600, color:DARK }}>{f.vendor}</td>
                <td style={{ padding:"11px 14px", color:"#555" }}>{f.product}</td>
                <td style={{ padding:"11px 14px", color:"#888" }}>{f.reporter}</td>
                <td style={{ padding:"11px 14px", color:"#aaa" }}>{f.date}</td>
                <td style={{ padding:"11px 14px" }}>{STATUS_BADGE[f.status]}</td>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button style={{ fontSize:11, padding:"4px 9px", border:`1px solid ${P}`, borderRadius:6, color:P, background:"#fff", cursor:"pointer" }}>Review</button>
                    {f.status!=="resolved" && <button style={{ fontSize:11, padding:"4px 9px", border:"1px solid #10b981", borderRadius:6, color:"#10b981", background:"#fff", cursor:"pointer" }}>Resolve</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Super Admin Shell ────────────────────────────────────────────────────────
const TABS = [
  ["overview",  "📊", "Overview"],
  ["vendors",   "🏪", "Vendors"],
  ["orders",    "🛍️", "Orders"],
  ["payouts",   "💸", "Payouts"],
  ["flags",     "🚩", "Moderation"],
  ["settings",  "⚙️", "Settings"],
];

export default function SuperAdmin({ onExit }) {
  const [tab, setTab] = useState("overview");

  const TAB_CONTENT = {
    overview: <TabOverview />,
    vendors:  <TabVendors />,
    orders:   <TabOrders />,
    payouts:  <TabPayouts />,
    flags:    <TabFlags />,
    settings: <TabSettings />,
  };

  const totalRev = MOCK_VENDORS.reduce((s,v) => s + v.revenue, 0);
  const totalFee = MOCK_VENDORS.reduce((s,v) => s + v.fee, 0);

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width:220, background:"#0a0929", display:"flex", flexDirection:"column", padding:"20px 0", position:"fixed", top:0, left:0, bottom:0, zIndex:50 }}>
        <div style={{ padding:"0 18px 20px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          <button onClick={onExit} style={{ background:"none", border:"none", color:"rgba(255,255,255,.35)", fontSize:11, cursor:"pointer", marginBottom:10, padding:0 }}>← Back to store</button>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"linear-gradient(135deg,#6C63FF,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⚡</div>
            <div>
              <p style={{ color:"#fff", fontWeight:800, fontSize:14 }}>Super Admin</p>
              <p style={{ color:"rgba(255,255,255,.3)", fontSize:10 }}>SocialSell Platform</p>
            </div>
          </div>
          <div style={{ background:"rgba(108,99,255,.15)", border:"1px solid rgba(108,99,255,.3)", borderRadius:8, padding:"8px 10px", marginTop:10 }}>
            <p style={{ color:"rgba(255,255,255,.5)", fontSize:10, marginBottom:2 }}>Platform GMV</p>
            <p style={{ color:"#a78bfa", fontWeight:900, fontSize:18 }}>{fmt(totalRev)}</p>
            <p style={{ color:"#10b981", fontSize:11, fontWeight:700 }}>Fee: {fmt(totalFee)}</p>
          </div>
        </div>

        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:"none", background:tab===id?"rgba(108,99,255,.22)":"transparent", color:tab===id?"#a78bfa":"rgba(255,255,255,.45)", fontSize:13, fontWeight:tab===id?700:400, textAlign:"left", cursor:"pointer", transition:"all .15s" }}>
              <span>{icon}</span>{label}
              {id==="flags" && <span style={{ marginLeft:"auto", background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>1</span>}
              {id==="vendors" && <span style={{ marginLeft:"auto", background:"#f59e0b", color:"#fff", fontSize:9, fontWeight:800, width:16, height:16, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>2</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <p style={{ color:"rgba(255,255,255,.25)", fontSize:10 }}>Logged in as</p>
          <p style={{ color:"rgba(255,255,255,.6)", fontSize:12, fontWeight:600 }}>Platform Owner</p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:220, flex:1, background:"#f8f7ff", padding:"32px 36px", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:DARK, marginBottom:3 }}>
              {TABS.find(t=>t[0]===tab)?.[2]}
            </h1>
            <p style={{ fontSize:13, color:"#aaa" }}>
              {tab==="overview" && "Full platform performance overview"}
              {tab==="vendors" && `${MOCK_VENDORS.length} vendors · ${MOCK_VENDORS.filter(v=>v.status==="pending_review").length} pending review`}
              {tab==="orders" && `${MOCK_ORDERS.length} recent orders`}
              {tab==="payouts" && "Manage vendor payout queue"}
              {tab==="flags" && `${MOCK_FLAGS.filter(f=>f.status!=="resolved").length} open issues`}
              {tab==="settings" && "Platform-wide configuration"}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#10b981", fontWeight:700, background:"#d1fae5", padding:"5px 12px", borderRadius:999 }}>● All systems operational</span>
          </div>
        </div>

        {TAB_CONTENT[tab]}
      </main>
    </div>
  );
}

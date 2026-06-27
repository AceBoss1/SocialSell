// ─────────────────────────────────────────────────────────────────────────────
// FILE PATH: src/components/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Seller / Vendor dashboard — all eight sections.
// Import into App.jsx:
//   import Dashboard from "./components/Dashboard";
// Replace the inline <SellerDashboard> with:
//   case "vendor": return <Dashboard user={user} onSignOut={signOut} />;
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from "react";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const P    = "#6C63FF";
const DARK = "#0c0b2e";

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id:1,  name:"Social Media Marketing Masterclass", type:"Course",   price:79.99, status:"active",  sales:234, cover:"🎓", desc:"Complete guide to growing on every social platform.", file:"masterclass-v2.zip",      size:"1.2 GB", tags:["social","marketing","course"],   created:"Jan 12, 2025" },
  { id:2,  name:"TikTok Template Pack",               type:"Template", price:29,    status:"active",  sales:312, cover:"🎨", desc:"200+ trending TikTok video templates.",               file:"tiktok-templates.zip",    size:"840 MB", tags:["tiktok","templates","video"],    created:"Feb 3, 2025" },
  { id:3,  name:"Beat Collection Vol. 1",             type:"Music",    price:49,    status:"active",  sales:87,  cover:"🎵", desc:"25 royalty-free beats for content creators.",         file:"beats-vol1.zip",          size:"320 MB", tags:["music","beats","royalty-free"],  created:"Mar 17, 2025" },
  { id:4,  name:"SEO Playbook 2025",                  type:"E-book",   price:19,    status:"active",  sales:521, cover:"📖", desc:"Step-by-step SEO for small businesses.",              file:"seo-playbook-2025.pdf",   size:"14 MB",  tags:["seo","marketing","ebook"],       created:"Apr 5, 2025" },
  { id:5,  name:"Brand Identity Kit",                 type:"Template", price:59,    status:"draft",   sales:0,   cover:"✏️", desc:"Logos, colours, fonts and brand guidelines.",        file:"brand-kit.zip",           size:"260 MB", tags:["branding","design","templates"], created:"May 20, 2025" },
  { id:6,  name:"AI Prompt Bible",                    type:"E-book",   price:39,    status:"active",  sales:198, cover:"🤖", desc:"1,000+ prompts for every creative use case.",        file:"ai-prompt-bible.pdf",     size:"8 MB",   tags:["ai","prompts","productivity"],   created:"Jun 1, 2025" },
  { id:7,  name:"YouTube Growth Academy",             type:"Course",   price:97,    status:"active",  sales:63,  cover:"🎬", desc:"Grow from 0 to 100K subscribers fast.",              file:"yt-academy.zip",          size:"4.1 GB", tags:["youtube","growth","video"],      created:"Jun 8, 2025" },
  { id:8,  name:"Podcast Launch Formula",             type:"Course",   price:79,    status:"draft",   sales:0,   cover:"🎙️", desc:"Go from idea to 10,000 listeners in 90 days.",      file:"podcast-formula.zip",     size:"2.8 GB", tags:["podcast","audio","launch"],      created:"Jun 14, 2025" },
];

const PRODUCT_TYPES   = ["Course","E-book","Template","Music","Software","Other"];
const STATUS_OPTIONS  = ["active","draft","suspended"];

const REV_BY_MONTH    = [8200,11400,9800,15600,13200,19800];
const MONTHS          = ["Jan","Feb","Mar","Apr","May","Jun"];

const SEED_ORDERS = [
  { id:"ORD-9901", buyer:"Ada Okonkwo",    product:"Social Media Marketing Masterclass", amount:79.99, date:"Jun 22", status:"paid",     platform:"instagram" },
  { id:"ORD-9900", buyer:"Carlos Rivera",  product:"TikTok Template Pack",               amount:29,    date:"Jun 22", status:"paid",     platform:"tiktok" },
  { id:"ORD-9899", buyer:"Priya Nair",     product:"AI Prompt Bible",                    amount:39,    date:"Jun 21", status:"paid",     platform:"google" },
  { id:"ORD-9898", buyer:"James Owusu",    product:"Beat Collection Vol. 1",             amount:49,    date:"Jun 21", status:"refunded", platform:"direct" },
  { id:"ORD-9897", buyer:"Sofia Müller",   product:"SEO Playbook 2025",                  amount:19,    date:"Jun 20", status:"paid",     platform:"facebook" },
  { id:"ORD-9896", buyer:"Kwame Asante",   product:"YouTube Growth Academy",             amount:97,    date:"Jun 20", status:"paid",     platform:"instagram" },
  { id:"ORD-9895", buyer:"Ngozi Adeyemi",  product:"TikTok Template Pack",               amount:29,    date:"Jun 19", status:"paid",     platform:"tiktok" },
];

const SEED_POSTS = [
  { id:1, platform:"Instagram", caption:"Just dropped the AI Prompt Bible 🔥 1,000+ prompts. Link in bio!", time:"Today 9:00 AM",   status:"published", product:"AI Prompt Bible" },
  { id:2, platform:"TikTok",    caption:"200+ TikTok templates that actually go viral 📈",                  time:"Today 2:00 PM",   status:"scheduled", product:"TikTok Template Pack" },
  { id:3, platform:"Facebook",  caption:"The Social Media Masterclass is now live. Enroll today.",          time:"Tomorrow 10:00 AM",status:"draft",     product:"Social Media Masterclass" },
  { id:4, platform:"Twitter/X", caption:"Thread: 10 things I learned from 1,000 SEO audits 🧵",            time:"Tomorrow 3:00 PM", status:"scheduled", product:"SEO Playbook 2025" },
];

const SEED_CUSTOMERS = [
  { id:1, name:"Ada Okonkwo",   email:"ada@example.com",    orders:4, spent:196, country:"🇳🇬", joined:"Feb 2025", status:"active" },
  { id:2, name:"Carlos Rivera", email:"carlos@example.com", orders:2, spent:128, country:"🇲🇽", joined:"Mar 2025", status:"active" },
  { id:3, name:"Priya Nair",    email:"priya@example.com",  orders:7, spent:381, country:"🇮🇳", joined:"Jan 2025", status:"vip"    },
  { id:4, name:"James Owusu",   email:"james@example.com",  orders:1, spent:79,  country:"🇬🇭", joined:"Apr 2025", status:"active" },
  { id:5, name:"Sofia Müller",  email:"sofia@example.com",  orders:5, spent:264, country:"🇩🇪", joined:"Dec 2024", status:"active" },
];

const SEED_AFFILIATES = [
  { id:1, name:"Amara Diallo",   code:"AMARA30", clicks:2104, sales:89,  earned:1780, tier:"Platinum", status:"active"  },
  { id:2, name:"Nkechi Obi",     code:"NKECHI20",clicks:1240, sales:54,  earned:1080, tier:"Gold",     status:"active"  },
  { id:3, name:"Kwame Asante",   code:"KWAME15", clicks:892,  sales:34,  earned:510,  tier:"Silver",   status:"active"  },
  { id:4, name:"Tunde Adeyemi",  code:"TUNDE10", clicks:340,  sales:12,  earned:120,  tier:"Bronze",   status:"pending" },
];

const PLAT_COLORS = {
  Instagram:"#E1306C", TikTok:"#010101", Facebook:"#1877F2",
  "Twitter/X":"#1DA1F2", Pinterest:"#E60023", YouTube:"#FF0000",
};
const STATUS_POST_COLOR = {
  published:{ c:"#065F46", bg:"#D1FAE5" },
  scheduled: { c:"#1D4ED8", bg:"#DBEAFE" },
  draft:     { c:"#92400E", bg:"#FEF3C7" },
};
const STATUS_ORDER_COLOR = {
  paid:     { c:"#065F46", bg:"#D1FAE5" },
  refunded: { c:"#6B7280", bg:"#F3F4F6" },
  disputed: { c:"#991B1B", bg:"#FEE2E2" },
};
const TIER_COLORS = {
  Platinum:{ c:"#0284C7", bg:"#E0F2FE" },
  Gold:    { c:"#B45309", bg:"#FEF9C3" },
  Silver:  { c:"#475569", bg:"#F1F5F9" },
  Bronze:  { c:"#92400E", bg:"#FEF3C7" },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Pill({ label, c, bg }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, color:c,
      background:bg, padding:"2px 9px",
      borderRadius:999, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #ededf5",
      borderRadius:14, padding:20, ...style }}>
      {children}
    </div>
  );
}

function SHead({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between",
      alignItems:"flex-start", marginBottom:24 }}>
      <div>
        <h2 style={{ fontSize:21, fontWeight:800,
          color:DARK, marginBottom:3 }}>{title}</h2>
        {sub && <p style={{ fontSize:14, color:"#888" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, sub, icon, vc=DARK }) {
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between",
        marginBottom:10 }}>
        <p style={{ fontSize:12, color:"#aaa", fontWeight:600 }}>{label}</p>
        {icon && <span style={{ fontSize:20 }}>{icon}</span>}
      </div>
      <p style={{ fontSize:26, fontWeight:900, color:vc, marginBottom:4 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:"#10b981", fontWeight:700 }}>{sub}</p>}
    </Card>
  );
}

function MiniBar({ pct, color=P }) {
  return (
    <div style={{ background:"#f1effe", borderRadius:4, height:6, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(pct,100)}%`, height:"100%",
        background:color, borderRadius:4, transition:"width .5s" }} />
    </div>
  );
}

function BarChart({ data, labels, color=P, h=120 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:h }}>
      {data.map((v,i) => (
        <div key={i} style={{ flex:1, display:"flex",
          flexDirection:"column", alignItems:"center", gap:5 }}>
          <div style={{ width:"100%", background:color,
            borderRadius:"4px 4px 0 0",
            height:`${(v/max)*(h-20)}px`,
            transition:"height .6s" }} />
          <span style={{ fontSize:10, color:"#aaa" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)}
      style={{ width:40, height:22, borderRadius:999,
        background:on?P:"#ddd", cursor:"pointer",
        position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3,
        left:on?20:3, width:16, height:16, borderRadius:"50%",
        background:"#fff", transition:"left .2s",
        boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
// Used for both Add and Edit.
function ProductModal({ initial, onSave, onClose }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(initial ?? {
    name:"", type:"Course", price:"", desc:"",
    status:"draft", tags:"", cover:"", file:"",
  });
  const [coverPreview, setCoverPreview] = useState(initial?.cover ?? "");
  const [errors, setErrors]             = useState({});
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // In production: replace with openUploadWidget() from lib/cloudinary.js
  const pickCoverEmoji = (emoji) => {
    setCoverPreview(emoji);
    set("cover", emoji);
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim())  e.name  = "Product name is required.";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Enter a valid price.";
    if (!form.desc?.trim())  e.desc  = "Description is required.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id:     initial?.id ?? Date.now(),
      price:  parseFloat(form.price),
      sales:  initial?.sales ?? 0,
      tags:   typeof form.tags === "string"
                ? form.tags.split(",").map(t => t.trim()).filter(Boolean)
                : form.tags,
      created: initial?.created ?? new Date().toLocaleDateString("en-GB",
        { day:"numeric", month:"short", year:"numeric" }),
    });
    onClose();
  };

  const COVER_EMOJIS = ["🎓","📖","🎨","🎵","🛠️","🚀","🎬","🎙️","🤖","✏️","💼","📊"];

  const Field = ({ label, error, children }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:700, color:"#555",
        display:"block", marginBottom:5 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize:11, color:"#ef4444", marginTop:4 }}>{error}</p>}
    </div>
  );

  const inputStyle = (err) => ({
    width:"100%", padding:"9px 12px",
    border:`1px solid ${err?"#ef4444":"#e0dfee"}`,
    borderRadius:8, fontSize:13, outline:"none",
    background: err?"#FFF5F5":"#fff",
    boxSizing:"border-box",
  });

  return (
    <div style={{ position:"fixed", inset:0,
      background:"rgba(12,11,46,.65)",
      display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:100,
      backdropFilter:"blur(4px)", padding:20 }}
      onClick={e => e.target===e.currentTarget && onClose()}>

      <div style={{ background:"#fff", borderRadius:20,
        width:"100%", maxWidth:580,
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 24px 60px rgba(0,0,0,.2)" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", padding:"20px 24px 16px",
          borderBottom:"1px solid #f0eeff", position:"sticky",
          top:0, background:"#fff", zIndex:1 }}>
          <div>
            <h3 style={{ fontSize:17, fontWeight:800, color:DARK, marginBottom:2 }}>
              {isEdit ? "Edit product" : "Add new product"}
            </h3>
            <p style={{ fontSize:12, color:"#aaa" }}>
              {isEdit ? "Update product details." : "Fill in the details below to list your product."}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:"#f5f5f5", border:"none",
              borderRadius:"50%", width:32, height:32,
              fontSize:16, cursor:"pointer", color:"#888",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 24px 24px" }}>

          {/* Cover icon picker */}
          <Field label="Cover image">
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
              <div style={{ width:72, height:72, borderRadius:14,
                background:`linear-gradient(135deg,${P},#4f46e5)`,
                display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:36,
                flexShrink:0 }}>
                {coverPreview || "📦"}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12, color:"#888", marginBottom:6 }}>
                  Choose a cover icon (or upload an image with Cloudinary in production)
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {COVER_EMOJIS.map(e => (
                    <button key={e} onClick={() => pickCoverEmoji(e)}
                      style={{ fontSize:20, background:
                          coverPreview===e?"#EEEDFE":"#f5f5f5",
                        border:`1.5px solid ${coverPreview===e?P:"transparent"}`,
                        borderRadius:8, padding:"4px 8px", cursor:"pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Cloudinary upload button — wired to lib/cloudinary.js in production */}
            <button style={{ display:"flex", alignItems:"center", gap:6,
              background:"#f8f7ff", border:"1.5px dashed #c4c0f5",
              borderRadius:8, padding:"8px 14px", fontSize:12,
              color:P, fontWeight:600, cursor:"pointer", width:"100%" }}>
              ☁️ Upload image via Cloudinary (connect in lib/cloudinary.js)
            </button>
          </Field>

          {/* Name */}
          <Field label="Product name *" error={errors.name}>
            <input value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder='e.g. "Social Media Marketing Masterclass"'
              style={inputStyle(errors.name)} />
          </Field>

          {/* Type + Price + Status row */}
          <div style={{ display:"grid",
            gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <Field label="Product type">
              <select value={form.type} onChange={e => set("type", e.target.value)}
                style={{ ...inputStyle(), cursor:"pointer" }}>
                {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Price (USD) *" error={errors.price}>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%",
                  transform:"translateY(-50%)",
                  color:"#aaa", fontSize:13 }}>$</span>
                <input type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={e => set("price", e.target.value)}
                  placeholder="29.99"
                  style={{ ...inputStyle(errors.price), paddingLeft:22 }} />
              </div>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)}
                style={{ ...inputStyle(), cursor:"pointer" }}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase()+s.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description *" error={errors.desc}>
            <textarea value={form.desc}
              onChange={e => set("desc", e.target.value)}
              rows={3} placeholder="What will buyers get? What problem does it solve?"
              style={{ ...inputStyle(errors.desc), resize:"vertical" }} />
          </Field>

          {/* Tags */}
          <Field label="Tags (comma-separated)">
            <input
              value={typeof form.tags==="object"
                ? form.tags.join(", ") : form.tags}
              onChange={e => set("tags", e.target.value)}
              placeholder="e.g. social media, marketing, course"
              style={inputStyle()} />
          </Field>

          {/* Digital file */}
          <Field label="Digital file">
            <div style={{ display:"flex", gap:10 }}>
              <input value={form.file ?? ""}
                onChange={e => set("file", e.target.value)}
                placeholder="Filename shown to buyer after purchase"
                style={{ ...inputStyle(), flex:1 }} />
              <button style={{ background:"#f8f7ff",
                border:"1.5px dashed #c4c0f5",
                borderRadius:8, padding:"0 14px",
                fontSize:12, color:P, fontWeight:600,
                cursor:"pointer", flexShrink:0 }}>
                ☁️ Upload
              </button>
            </div>
            <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>
              In production this triggers the Cloudinary private upload
              from <code>lib/cloudinary.js</code>
            </p>
          </Field>

          {/* Footer */}
          <div style={{ display:"flex", gap:10,
            justifyContent:"flex-end", marginTop:6 }}>
            <button onClick={onClose}
              style={{ background:"#f5f5f5", border:"none",
                borderRadius:8, padding:"10px 20px",
                fontSize:13, fontWeight:600,
                color:"#555", cursor:"pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave}
              style={{ background:P, border:"none",
                color:"#fff", borderRadius:8,
                padding:"10px 24px", fontSize:13,
                fontWeight:800, cursor:"pointer" }}>
              {isEdit ? "Save changes" : "Add product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ product, onConfirm, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0,
      background:"rgba(12,11,46,.65)",
      display:"flex", alignItems:"center",
      justifyContent:"center", zIndex:200,
      backdropFilter:"blur(4px)", padding:20 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16,
        padding:"28px 28px 24px",
        maxWidth:380, width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ fontSize:36, textAlign:"center", marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontSize:17, fontWeight:800, color:DARK,
          textAlign:"center", marginBottom:8 }}>
          Delete product?
        </h3>
        <p style={{ fontSize:13, color:"#888", textAlign:"center",
          lineHeight:1.6, marginBottom:22 }}>
          <strong style={{ color:DARK }}>{product.name}</strong> will be permanently
          removed. This cannot be undone.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, background:"#f5f5f5", border:"none",
              borderRadius:8, padding:"10px",
              fontSize:13, fontWeight:600,
              color:"#555", cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={() => { onConfirm(product.id); onClose(); }}
            style={{ flex:1, background:"#ef4444", border:"none",
              color:"#fff", borderRadius:8, padding:"10px",
              fontSize:13, fontWeight:800, cursor:"pointer" }}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VIEW: My Products ────────────────────────────────────────────────────────
function MyProducts() {
  const [products, setProducts]     = useState(SEED_PRODUCTS);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [layout, setLayout]         = useState("grid"); // "grid" | "list"
  const [showAdd, setShowAdd]       = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);

  // Filters
  const shown = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType   = typeFilter   === "All" || p.type   === typeFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleSave = (product) => {
    setProducts(prev =>
      prev.some(p => p.id === product.id)
        ? prev.map(p => p.id === product.id ? product : p)
        : [product, ...prev]
    );
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = (id) => {
    setProducts(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: p.status === "active" ? "draft" : "active" }
        : p
    ));
  };

  const STATUS_PILL = {
    active:    <Pill label="Active"    c="#065F46" bg="#D1FAE5" />,
    draft:     <Pill label="Draft"     c="#92400E" bg="#FEF3C7" />,
    suspended: <Pill label="Suspended" c="#991B1B" bg="#FEE2E2" />,
  };

  const totalRevenue = products.reduce((s,p)=>s+(p.price*p.sales),0);
  const activeCount  = products.filter(p=>p.status==="active").length;
  const draftCount   = products.filter(p=>p.status==="draft").length;

  return (
    <div>
      <SHead
        title="My Products"
        sub="Manage everything you sell — add, edit, publish or unpublish."
        action={
          <button onClick={() => setShowAdd(true)}
            style={{ background:P, color:"#fff", border:"none",
              borderRadius:9, padding:"10px 20px",
              fontSize:13, fontWeight:800, cursor:"pointer",
              display:"flex", alignItems:"center", gap:6 }}>
            + Add product
          </button>
        }
      />

      {/* Summary stats */}
      <div style={{ display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:14, marginBottom:22 }}>
        <StatCard label="Total products" value={products.length}    icon="📦" />
        <StatCard label="Active"         value={activeCount}         icon="✅" vc="#10b981" />
        <StatCard label="Drafts"         value={draftCount}          icon="📝" vc="#f59e0b" />
        <StatCard label="Total revenue"  value={`$${totalRevenue.toLocaleString()}`} icon="💰" vc={P} />
      </div>

      {/* Filter bar */}
      <div style={{ display:"flex", gap:10, marginBottom:18,
        flexWrap:"wrap", alignItems:"center" }}>

        {/* Search */}
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:12, top:"50%",
            transform:"translateY(-50%)",
            fontSize:14, color:"#aaa" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or tag…"
            style={{ paddingLeft:34, width:"100%",
              border:"1px solid #e0dfee", borderRadius:8,
              fontSize:13, padding:"9px 12px 9px 34px", outline:"none" }} />
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
          style={{ padding:"9px 12px", border:"1px solid #e0dfee",
            borderRadius:8, fontSize:13, background:"#fff",
            cursor:"pointer", color:"#555" }}>
          {["All",...PRODUCT_TYPES].map(t=>(
            <option key={t} value={t}>{t === "All" ? "All types" : t}</option>
          ))}
        </select>

        {/* Status filter */}
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          style={{ padding:"9px 12px", border:"1px solid #e0dfee",
            borderRadius:8, fontSize:13, background:"#fff",
            cursor:"pointer", color:"#555" }}>
          {["All","active","draft","suspended"].map(s=>(
            <option key={s} value={s}>
              {s==="All"?"All statuses":s.charAt(0).toUpperCase()+s.slice(1)}
            </option>
          ))}
        </select>

        {/* Layout toggle */}
        <div style={{ display:"flex", border:"1px solid #e0dfee",
          borderRadius:8, overflow:"hidden", flexShrink:0 }}>
          {[["grid","⊞"],["list","≡"]].map(([id,icon])=>(
            <button key={id} onClick={()=>setLayout(id)}
              style={{ padding:"8px 14px", border:"none",
                background:layout===id?"#EEEDFE":"#fff",
                color:layout===id?P:"#888",
                fontSize:16, cursor:"pointer" }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {shown.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px 0" }}>
          <p style={{ fontSize:40, marginBottom:10 }}>📭</p>
          <p style={{ fontWeight:700, fontSize:16, color:DARK, marginBottom:6 }}>
            No products found
          </p>
          <p style={{ fontSize:13, color:"#aaa" }}>
            {search || typeFilter !== "All" || statusFilter !== "All"
              ? "Try adjusting your filters."
              : "Add your first product to get started."}
          </p>
        </div>
      )}

      {/* Grid layout */}
      {layout === "grid" && shown.length > 0 && (
        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",
          gap:16 }}>
          {shown.map(p => (
            <div key={p.id}
              style={{ background:"#fff", border:"1px solid #ededf5",
                borderRadius:14, overflow:"hidden",
                transition:"transform .15s, box-shadow .15s" }}
              onMouseEnter={e=>{
                e.currentTarget.style.transform="translateY(-2px)";
                e.currentTarget.style.boxShadow="0 8px 24px rgba(108,99,255,.12)";
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform="";
                e.currentTarget.style.boxShadow="";
              }}>

              {/* Cover */}
              <div style={{ height:120,
                background:`linear-gradient(135deg,${P},#4f46e5)`,
                display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:40,
                position:"relative" }}>
                {p.cover || "📦"}
                <div style={{ position:"absolute", top:8, right:8 }}>
                  {STATUS_PILL[p.status]}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding:"12px 14px" }}>
                <p style={{ fontWeight:700, fontSize:13, color:DARK,
                  lineHeight:1.35, marginBottom:4,
                  overflow:"hidden", display:"-webkit-box",
                  WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                  {p.name}
                </p>
                <p style={{ fontSize:11, color:"#aaa", marginBottom:8 }}>
                  {p.type} · {p.sales} sold
                </p>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontWeight:900, fontSize:16, color:DARK }}>
                    ${p.price}
                  </span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#10b981" }}>
                    ${(p.price*p.sales).toLocaleString()} rev.
                  </span>
                </div>

                {/* Tags */}
                {p.tags?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap",
                    gap:4, marginBottom:12 }}>
                    {p.tags.slice(0,3).map(t=>(
                      <span key={t} style={{ fontSize:10, background:"#f5f5f5",
                        color:"#888", padding:"2px 7px", borderRadius:999 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>setEditing(p)}
                    style={{ flex:1, padding:"7px", fontSize:12,
                      border:`1px solid ${P}`, borderRadius:7,
                      color:P, background:"#fff",
                      fontWeight:600, cursor:"pointer" }}>
                    Edit
                  </button>
                  <button onClick={()=>toggleStatus(p.id)}
                    style={{ flex:1, padding:"7px", fontSize:12,
                      border:"1px solid #e0dfee",
                      borderRadius:7, color:"#555",
                      background:"#fff", fontWeight:600, cursor:"pointer" }}>
                    {p.status==="active"?"Unpublish":"Publish"}
                  </button>
                  <button onClick={()=>setDeleting(p)}
                    style={{ padding:"7px 10px", fontSize:14,
                      border:"1px solid #fecaca",
                      borderRadius:7, color:"#ef4444",
                      background:"#fff", cursor:"pointer" }}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List layout */}
      {layout === "list" && shown.length > 0 && (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#f9f8ff",
                borderBottom:"1px solid #ededf5" }}>
                {["Product","Type","Price","Sales","Revenue","Status",""].map(h=>(
                  <th key={h} style={{ textAlign:"left", padding:"10px 14px",
                    fontSize:11, fontWeight:700, color:"#aaa",
                    textTransform:"uppercase", letterSpacing:".05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((p,i)=>(
                <tr key={p.id}
                  style={{ borderBottom:"1px solid #f5f5ff",
                    background:i%2===0?"#fff":"#fefeff" }}>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex",
                      alignItems:"center", gap:10 }}>
                      <div style={{ width:38, height:38, borderRadius:8,
                        background:`linear-gradient(135deg,${P},#4f46e5)`,
                        display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:20,
                        flexShrink:0 }}>
                        {p.cover||"📦"}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontWeight:700, color:DARK,
                          overflow:"hidden", textOverflow:"ellipsis",
                          whiteSpace:"nowrap", maxWidth:220,
                          marginBottom:2 }}>
                          {p.name}
                        </p>
                        <p style={{ fontSize:11, color:"#aaa" }}>
                          {p.file || "No file attached"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <Pill label={p.type} c={P} bg="#EEEDFE" />
                  </td>
                  <td style={{ padding:"12px 14px",
                    fontWeight:700, color:DARK }}>${p.price}</td>
                  <td style={{ padding:"12px 14px", color:"#555" }}>
                    {p.sales.toLocaleString()}
                  </td>
                  <td style={{ padding:"12px 14px",
                    fontWeight:700, color:"#10b981" }}>
                    ${(p.price*p.sales).toLocaleString()}
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    {STATUS_PILL[p.status]}
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setEditing(p)}
                        style={{ padding:"5px 12px", fontSize:12,
                          border:`1px solid ${P}`, borderRadius:6,
                          color:P, background:"#fff",
                          fontWeight:600, cursor:"pointer" }}>
                        Edit
                      </button>
                      <button onClick={()=>toggleStatus(p.id)}
                        style={{ padding:"5px 12px", fontSize:12,
                          border:"1px solid #e0dfee", borderRadius:6,
                          color:"#555", background:"#fff",
                          fontWeight:600, cursor:"pointer" }}>
                        {p.status==="active"?"Unpublish":"Publish"}
                      </button>
                      <button onClick={()=>setDeleting(p)}
                        style={{ padding:"5px 10px", fontSize:14,
                          border:"1px solid #fecaca", borderRadius:6,
                          color:"#ef4444", background:"#fff",
                          cursor:"pointer" }}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modals */}
      {showAdd   && <ProductModal onSave={handleSave} onClose={()=>setShowAdd(false)} />}
      {editing   && <ProductModal initial={editing} onSave={handleSave} onClose={()=>setEditing(null)} />}
      {deleting  && <ConfirmModal product={deleting} onConfirm={handleDelete} onClose={()=>setDeleting(null)} />}
    </div>
  );
}

// ─── VIEW: Overview ───────────────────────────────────────────────────────────
function Overview({ user }) {
  return (
    <div>
      <SHead
        title={`Welcome back${user?.name ? ", "+user.name : ""} 👋`}
        sub="Here's how your store is performing."
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14, marginBottom:22 }}>
        <StatCard label="Total Revenue" value="$78,400" sub="+24% this month" icon="💰" vc={P}    />
        <StatCard label="Total Sales"   value="1,369"   sub="+18% this month" icon="🛍️"           />
        <StatCard label="Products"      value="8"        sub="6 active"        icon="📦"           />
        <StatCard label="Platforms"     value="5 / 8"                         icon="🌐"           />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        <Card>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16 }}>
            Revenue — last 6 months
          </p>
          <BarChart data={REV_BY_MONTH} labels={MONTHS} />
        </Card>
        <Card>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
            Traffic sources
          </p>
          {[["Instagram",38,"#E1306C"],["TikTok",27,"#333"],
            ["Google",19,"#4285F4"],["Facebook",10,"#1877F2"],["Direct",6,P]].map(([n,p,c])=>(
            <div key={n} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                marginBottom:4 }}>
                <span style={{ fontSize:12, color:"#555" }}>{n}</span>
                <span style={{ fontSize:12, fontWeight:700, color:DARK }}>{p}%</span>
              </div>
              <MiniBar pct={p} color={c} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── VIEW: Analytics ─────────────────────────────────────────────────────────
function Analytics() {
  return (
    <div>
      <SHead title="Analytics" sub="Deep insights across all products and platforms." />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14, marginBottom:22 }}>
        <StatCard label="Revenue"     value="$78,400" sub="+24%" vc={P}        icon="💰" />
        <StatCard label="Sales"       value="1,369"   sub="+18%"               icon="🛍️" />
        <StatCard label="Avg. Order"  value="$57.27"  sub="+6%"                icon="🎯" />
        <StatCard label="Conversion"  value="3.4%"    sub="-0.2%"              icon="📊" />
      </div>
      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:16 }}>
          Revenue trend
        </p>
        <BarChart data={REV_BY_MONTH} labels={MONTHS} h={140} />
      </Card>
      <Card>
        <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
          Top products by revenue
        </p>
        <table>
          <thead>
            <tr>
              {["Product","Type","Sales","Revenue","Rating"].map(h=>(
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...SEED_PRODUCTS].sort((a,b)=>b.sales-a.sales).slice(0,6).map(p=>(
              <tr key={p.id}>
                <td style={{ fontWeight:600, color:DARK }}>{p.name}</td>
                <td><Pill label={p.type} c={P} bg="#EEEDFE" /></td>
                <td>{p.sales.toLocaleString()}</td>
                <td style={{ fontWeight:700, color:"#10b981" }}>
                  ${(p.price*p.sales).toLocaleString()}
                </td>
                <td>⭐ 4.8</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── VIEW: Publishing ─────────────────────────────────────────────────────────
function Publishing() {
  const [posts, setPosts] = useState(SEED_POSTS);
  const [np, setNp]       = useState({ platform:"Instagram", caption:"", product:"", time:"" });

  const addPost = () => {
    if (!np.caption.trim()) return;
    setPosts(prev=>[...prev,{ ...np, id:Date.now(), status:"scheduled" }]);
    setNp({ platform:"Instagram", caption:"", product:"", time:"" });
  };

  return (
    <div>
      <SHead title="Social Publishing"
        sub="Schedule and auto-publish posts across every connected platform." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:12 }}>Queue</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {posts.map(p=>{
              const sc = STATUS_POST_COLOR[p.status]??{c:"#888",bg:"#f5f5f5"};
              return (
                <Card key={p.id} style={{ padding:14 }}>
                  <div style={{ display:"flex", alignItems:"center",
                    gap:8, marginBottom:6 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%",
                      background:PLAT_COLORS[p.platform]??"#aaa",
                      display:"inline-block" }} />
                    <span style={{ fontSize:12, fontWeight:700,
                      color:PLAT_COLORS[p.platform]??"#555" }}>
                      {p.platform}
                    </span>
                    <Pill label={p.status} c={sc.c} bg={sc.bg} />
                    <span style={{ fontSize:11, color:"#aaa", marginLeft:"auto" }}>
                      {p.time}
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:"#555",
                    lineHeight:1.5, marginBottom:p.product?6:0 }}>
                    {p.caption}
                  </p>
                  {p.product && (
                    <Pill label={`📦 ${p.product}`} c={P} bg="#EEEDFE" />
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
            New post
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Platform","platform","select"],["Link product","product","select"]].map(([lbl,key,el])=>(
              <div key={key}>
                <label style={{ fontSize:12, fontWeight:600, color:"#555",
                  display:"block", marginBottom:4 }}>{lbl}</label>
                {key==="platform"
                  ? <select value={np.platform}
                      onChange={e=>setNp(n=>({...n,platform:e.target.value}))}
                      style={{ width:"100%", padding:"9px 12px",
                        border:"1px solid #e0dfee", borderRadius:8,
                        fontSize:13, background:"#fff", cursor:"pointer" }}>
                      {Object.keys(PLAT_COLORS).map(pl=><option key={pl}>{pl}</option>)}
                    </select>
                  : <select value={np.product}
                      onChange={e=>setNp(n=>({...n,product:e.target.value}))}
                      style={{ width:"100%", padding:"9px 12px",
                        border:"1px solid #e0dfee", borderRadius:8,
                        fontSize:13, background:"#fff", cursor:"pointer" }}>
                      <option value="">— None —</option>
                      {SEED_PRODUCTS.map(p=><option key={p.id}>{p.name}</option>)}
                    </select>}
              </div>
            ))}
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#555",
                display:"block", marginBottom:4 }}>Caption</label>
              <textarea value={np.caption}
                onChange={e=>setNp(n=>({...n,caption:e.target.value}))}
                rows={4} placeholder="Write your post caption…"
                style={{ width:"100%", padding:"9px 12px",
                  border:"1px solid #e0dfee", borderRadius:8,
                  fontSize:13, resize:"none", outline:"none",
                  fontFamily:"inherit" }} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#555",
                display:"block", marginBottom:4 }}>Schedule time</label>
              <input type="datetime-local" value={np.time}
                onChange={e=>setNp(n=>({...n,time:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px",
                  border:"1px solid #e0dfee", borderRadius:8,
                  fontSize:13, outline:"none" }} />
            </div>
            <button onClick={addPost}
              style={{ background:P, color:"#fff", border:"none",
                borderRadius:8, padding:"10px",
                fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Schedule post
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── VIEW: Customers ──────────────────────────────────────────────────────────
function Customers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const shown = SEED_CUSTOMERS.filter(c=>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const cust = SEED_CUSTOMERS.find(c=>c.id===selected);
  const SCOL = {
    active:{ c:"#065F46",bg:"#D1FAE5" },
    vip:   { c:"#1D4ED8",bg:"#DBEAFE" },
    new:   { c:"#92400E",bg:"#FEF3C7" },
  };
  return (
    <div>
      <SHead title="Customers" sub="Everyone who has bought from your store." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width:"100%", padding:"9px 12px",
              border:"1px solid #e0dfee", borderRadius:8,
              fontSize:13, outline:"none", marginBottom:12 }} />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {shown.map((c,i)=>{
              const sc = SCOL[c.status]??{c:"#888",bg:"#f5f5f5"};
              return (
                <div key={c.id} onClick={()=>setSelected(c.id)}
                  style={{ display:"flex", alignItems:"center",
                    gap:12, background:"#fff",
                    border:`1px solid ${selected===c.id?P:"#ededf5"}`,
                    borderRadius:12, padding:"12px 14px",
                    cursor:"pointer", transition:"border-color .15s" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%",
                    background:P, display:"flex", alignItems:"center",
                    justifyContent:"center", color:"#fff",
                    fontWeight:800, fontSize:15, flexShrink:0 }}>
                    {c.name[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:DARK,
                      marginBottom:1 }}>{c.name} {c.country}</p>
                    <p style={{ fontSize:12, color:"#aaa",
                      overflow:"hidden", textOverflow:"ellipsis",
                      whiteSpace:"nowrap" }}>{c.email}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontWeight:700, fontSize:13,
                      color:"#10b981", marginBottom:2 }}>${c.spent}</p>
                    <p style={{ fontSize:11, color:"#aaa" }}>{c.orders} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!cust ? (
          <div style={{ background:"#f8f7ff",
            border:"1px dashed #c4c0f5",
            borderRadius:14, display:"flex",
            alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:8, padding:32 }}>
            <p style={{ fontSize:32 }}>👤</p>
            <p style={{ color:"#aaa", fontSize:14 }}>
              Select a customer to see details
            </p>
          </div>
        ) : (
          <Card>
            <div style={{ display:"flex", gap:14, alignItems:"center",
              marginBottom:20, paddingBottom:16,
              borderBottom:"1px solid #f5f5ff" }}>
              <div style={{ width:52, height:52, borderRadius:"50%",
                background:P, display:"flex", alignItems:"center",
                justifyContent:"center", color:"#fff",
                fontWeight:800, fontSize:20, flexShrink:0 }}>
                {cust.name[0]}
              </div>
              <div>
                <p style={{ fontWeight:800, fontSize:16,
                  color:DARK, marginBottom:2 }}>
                  {cust.name} {cust.country}
                </p>
                <p style={{ fontSize:12, color:"#aaa" }}>
                  {cust.email} · Joined {cust.joined}
                </p>
              </div>
            </div>
            <div style={{ display:"grid",
              gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {[["Orders",cust.orders],["Spent",`$${cust.spent}`],
                ["Avg.",`$${Math.round(cust.spent/cust.orders)}`]].map(([l,v])=>(
                <div key={l} style={{ background:"#f8f7ff",
                  borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>{l}</p>
                  <p style={{ fontSize:16, fontWeight:800, color:DARK }}>{v}</p>
                </div>
              ))}
            </div>
            <p style={{ fontWeight:700, fontSize:13, color:DARK, marginBottom:10 }}>
              Purchase history
            </p>
            {SEED_PRODUCTS.slice(0,cust.orders).map(p=>(
              <div key={p.id} style={{ display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                padding:"9px 0",
                borderBottom:"1px solid #f5f5ff" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600,
                    color:DARK, marginBottom:2 }}>{p.name}</p>
                  <p style={{ fontSize:11, color:"#aaa" }}>{p.type}</p>
                </div>
                <span style={{ fontWeight:700, color:P }}>${p.price}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── VIEW: Affiliates ─────────────────────────────────────────────────────────
function Affiliates() {
  const [tab, setTab] = useState("all");
  const shown = tab==="all"
    ? SEED_AFFILIATES
    : SEED_AFFILIATES.filter(a=>a.status===tab);
  return (
    <div>
      <SHead title="Affiliate Network"
        sub="Track who's promoting your products and how much they've earned." />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14, marginBottom:20 }}>
        <StatCard label="Affiliates"        value={SEED_AFFILIATES.length} icon="🤝" />
        <StatCard label="Total commissions" value="$3,510" icon="💸" vc="#10b981" />
        <StatCard label="Referral sales"    value="189"    icon="🛍️" />
        <StatCard label="Avg. commission"   value="16.2%"  icon="📊" vc={P} />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["all","All"],["active","Active"],["pending","Pending"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{ padding:"7px 16px", borderRadius:999,
              border:`1.5px solid ${tab===v?P:"#e0dfee"}`,
              background:tab===v?P:"#fff",
              color:tab===v?"#fff":"#555",
              fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <table>
          <thead>
            <tr>
              {["Affiliate","Code","Clicks","Sales","Earned","Tier","Status"].map(h=>(
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(a=>{
              const tc = TIER_COLORS[a.tier];
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:"50%",
                        background:P, display:"flex", alignItems:"center",
                        justifyContent:"center", color:"#fff",
                        fontWeight:800, fontSize:13 }}>
                        {a.name[0]}
                      </div>
                      <span style={{ fontWeight:600, color:DARK }}>{a.name}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize:11, background:"#f5f5f5",
                      padding:"2px 7px", borderRadius:5 }}>{a.code}</code>
                  </td>
                  <td>{a.clicks.toLocaleString()}</td>
                  <td>{a.sales}</td>
                  <td style={{ fontWeight:700, color:"#10b981" }}>
                    ${a.earned.toLocaleString()}
                  </td>
                  <td><Pill label={a.tier} c={tc.c} bg={tc.bg} /></td>
                  <td>
                    <Pill
                      label={a.status}
                      c={a.status==="active"?"#065F46":"#92400E"}
                      bg={a.status==="active"?"#D1FAE5":"#FEF3C7"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── VIEW: Payouts ────────────────────────────────────────────────────────────
function Payouts() {
  const HIST = [
    { id:"PAY-041", amount:4312.50, currency:"USD", provider:"Stripe",   status:"completed", date:"Jun 21" },
    { id:"PAY-040", amount:8940,    currency:"NGN", provider:"Paystack", status:"processing", date:"Jun 21" },
    { id:"PAY-039", amount:2180,    currency:"GBP", provider:"Stripe",   status:"pending",   date:"Jun 22" },
  ];
  const SC = {
    completed:  { c:"#065F46", bg:"#D1FAE5" },
    processing: { c:"#1D4ED8", bg:"#DBEAFE" },
    pending:    { c:"#92400E", bg:"#FEF3C7" },
  };
  return (
    <div>
      <SHead title="Payouts" sub="Your earnings and withdrawal history." />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
        gap:14, marginBottom:22 }}>
        <StatCard label="Available balance" value="$3,240" sub="Payout Jun 27" icon="💰" vc={P} />
        <StatCard label="Paid out (June)"   value="$14,820"                    icon="✅" vc="#10b981" />
        <StatCard label="Next payout"       value="Jun 27"  sub="Thursday"     icon="📅" />
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:16 }}>
          <p style={{ fontWeight:700, fontSize:14, color:DARK }}>
            Payout history
          </p>
          <button style={{ background:P, color:"#fff", border:"none",
            borderRadius:8, padding:"8px 16px",
            fontSize:13, fontWeight:700, cursor:"pointer" }}>
            Request payout
          </button>
        </div>
        <table>
          <thead>
            <tr>
              {["ID","Amount","Currency","Provider","Status","Date"].map(h=>(
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HIST.map(p=>{
              const sc = SC[p.status];
              return (
                <tr key={p.id}>
                  <td>
                    <code style={{ fontSize:11, background:"#f5f5f5",
                      padding:"2px 7px", borderRadius:5 }}>{p.id}</code>
                  </td>
                  <td style={{ fontWeight:700, color:"#10b981" }}>
                    {p.amount.toLocaleString()}
                  </td>
                  <td><Pill label={p.currency} c="#555" bg="#f5f5f5" /></td>
                  <td>
                    <Pill
                      label={p.provider}
                      c={p.provider==="Stripe"?"#635BFF":"#00C3F7"}
                      bg={p.provider==="Stripe"?"#F0EEFF":"#E5FAFF"}
                    />
                  </td>
                  <td><Pill label={p.status} c={sc.c} bg={sc.bg} /></td>
                  <td style={{ color:"#aaa" }}>{p.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── VIEW: Settings ───────────────────────────────────────────────────────────
function Settings({ user }) {
  const [form, setForm] = useState({
    storeName:   "My Digital Store",
    storeSlug:   "my-digital-store",
    email:       user?.email ?? "",
    bio:         "",
    currency:    "USD",
    payoutEmail: "",
    notifySale:  true,
    notifyPayout:true,
    notifyReview:false,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div>
      <SHead title="Settings" sub="Manage your store profile, payments, and preferences." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div>
          <Card style={{ marginBottom:16 }}>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Store profile
            </p>
            {[["Store name","storeName","text"],
              ["Store URL slug","storeSlug","text"],
              ["Contact email","email","email"]].map(([l,k,t])=>(
              <div key={k} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"#555",
                  display:"block", marginBottom:4 }}>{l}</label>
                <input type={t} value={form[k]}
                  onChange={e=>set(k,e.target.value)}
                  style={{ width:"100%", padding:"9px 12px",
                    border:"1px solid #e0dfee", borderRadius:8,
                    fontSize:13, outline:"none" }} />
              </div>
            ))}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#555",
                display:"block", marginBottom:4 }}>Bio</label>
              <textarea value={form.bio}
                onChange={e=>set("bio",e.target.value)}
                rows={3} placeholder="Tell buyers about you and what you sell…"
                style={{ width:"100%", padding:"9px 12px",
                  border:"1px solid #e0dfee", borderRadius:8,
                  fontSize:13, outline:"none", resize:"none",
                  fontFamily:"inherit" }} />
            </div>
            <button style={{ background:P, color:"#fff", border:"none",
              borderRadius:8, padding:"9px 18px",
              fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Save profile
            </button>
          </Card>

          <Card>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Payout settings
            </p>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#555",
                display:"block", marginBottom:4 }}>Preferred currency</label>
              <select value={form.currency} onChange={e=>set("currency",e.target.value)}
                style={{ width:"100%", padding:"9px 12px",
                  border:"1px solid #e0dfee", borderRadius:8,
                  fontSize:13, background:"#fff", cursor:"pointer" }}>
                {["USD","NGN","EUR","GBP","GHS","KES"].map(c=>(
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#555",
                display:"block", marginBottom:4 }}>Paystack / Stripe email</label>
              <input value={form.payoutEmail}
                onChange={e=>set("payoutEmail",e.target.value)}
                placeholder="email connected to your payout account"
                style={{ width:"100%", padding:"9px 12px",
                  border:"1px solid #e0dfee", borderRadius:8,
                  fontSize:13, outline:"none" }} />
            </div>
            <button style={{ background:P, color:"#fff", border:"none",
              borderRadius:8, padding:"9px 18px",
              fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Save payout settings
            </button>
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom:16 }}>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Notifications
            </p>
            {[["notifySale",  "New sale on any product"],
              ["notifyPayout","Payout processed"],
              ["notifyReview","New product review"]].map(([k,l])=>(
              <div key={k} style={{ display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                padding:"10px 0",
                borderBottom:"1px solid #f9f8ff" }}>
                <p style={{ fontSize:13, color:"#555" }}>{l}</p>
                <Toggle on={form[k]} onChange={v=>set(k,v)} />
              </div>
            ))}
          </Card>

          <Card>
            <p style={{ fontWeight:700, fontSize:14, color:DARK, marginBottom:14 }}>
              Connected platforms
            </p>
            {[["Instagram","#E1306C",true],["TikTok","#010101",true],
              ["Facebook","#1877F2",true],["Twitter/X","#1DA1F2",false],
              ["Pinterest","#E60023",false]].map(([name,color,on])=>(
              <div key={name} style={{ display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                padding:"10px 0",
                borderBottom:"1px solid #f9f8ff" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%",
                    background:color, display:"inline-block" }} />
                  <span style={{ fontSize:13, color:"#555" }}>{name}</span>
                </div>
                {on
                  ? <Pill label="Connected" c="#065F46" bg="#D1FAE5" />
                  : <button style={{ fontSize:12, border:`1px solid ${P}`,
                      borderRadius:6, padding:"4px 10px",
                      color:P, background:"#fff",
                      fontWeight:600, cursor:"pointer" }}>
                      Connect
                    </button>}
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
  ["overview",   "📊","Overview"],
  ["products",   "📦","My Products"],
  ["analytics",  "📈","Analytics"],
  ["publishing", "📢","Publishing"],
  ["customers",  "👥","Customers"],
  ["affiliates", "🔗","Affiliates"],
  ["payouts",    "💸","Payouts"],
  ["settings",   "⚙️","Settings"],
];

export default function Dashboard({ user, onSignOut }) {
  const [view, setView] = useState("overview");

  const VIEW_MAP = {
    overview:   <Overview user={user} />,
    products:   <MyProducts />,
    analytics:  <Analytics />,
    publishing: <Publishing />,
    customers:  <Customers />,
    affiliates: <Affiliates />,
    payouts:    <Payouts />,
    settings:   <Settings user={user} />,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width:210, background:DARK, display:"flex",
        flexDirection:"column", padding:"20px 0",
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        overflowY:"auto" }}>

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
              {(user?.name?.[0] ?? "S").toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ color:"#fff", fontWeight:700, fontSize:13,
                overflow:"hidden", textOverflow:"ellipsis",
                whiteSpace:"nowrap" }}>
                {user?.name ?? "Your Store"}
              </p>
              <span style={{ fontSize:10, fontWeight:700, color:P,
                background:"#EEEDFE", padding:"1px 7px",
                borderRadius:999 }}>Pro plan</span>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:"12px 8px",
          display:"flex", flexDirection:"column", gap:2 }}>
          {NAV_ITEMS.map(([id,icon,label]) => (
            <button key={id} onClick={() => setView(id)}
              style={{ display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", borderRadius:8, border:"none",
                background: view===id?"rgba(108,99,255,.22)":"transparent",
                color: view===id?"#a78bfa":"rgba(255,255,255,.45)",
                fontSize:13, fontWeight: view===id?700:400,
                textAlign:"left", cursor:"pointer",
                transition:"all .15s" }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"12px 16px",
          borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <button onClick={onSignOut}
            style={{ width:"100%",
              background:"rgba(239,68,68,.12)",
              color:"#fca5a5",
              border:"1px solid rgba(239,68,68,.2)",
              borderRadius:8, padding:"8px",
              fontSize:12, fontWeight:600, cursor:"pointer" }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:210, flex:1,
        background:"#f8f7ff", padding:"32px 36px",
        minHeight:"100vh", overflowY:"auto" }}>
        {VIEW_MAP[view] ?? VIEW_MAP.overview}
      </main>
    </div>
  );
}

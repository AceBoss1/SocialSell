# FILE PATH: DEPLOYMENT.md

# SocialSell — Deployment Guide
## GitHub → Vercel → Supabase

---

## Before you start — checklist

You need these accounts ready:
- [ ] [GitHub](https://github.com) — to host the code
- [ ] [Vercel](https://vercel.com) — to deploy the frontend
- [ ] [Supabase](https://supabase.com) — already set up (you said it's connected)
- [ ] Node.js 18+ installed — check with `node -v`
- [ ] Git installed — check with `git --version`

---

## STEP 1 — Prepare your local project

Open your terminal and navigate to the project folder:

```bash
cd path/to/socialsell
```

Install dependencies:

```bash
npm install
```

Make sure it runs locally before touching Git:

```bash
npm start
```

Open `http://localhost:3000` — you should see the landing page.
If it works, kill the server with `Ctrl + C` and move on.

---

## STEP 2 — Create the .env file (local only)

Copy the example file:

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum these two lines to start
(you can add the rest later — the app runs without them):

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get both values from:
**Supabase Dashboard → Your Project → Settings → API**

> `.env` is already in `.gitignore` — it will NEVER be pushed to GitHub.

---

## STEP 3 — Create .gitignore

Create this file at the project root if it doesn't exist:

```bash
# FILE PATH: .gitignore

# Dependencies
node_modules/

# Environment variables — NEVER commit these
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build output
build/
dist/

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

## STEP 4 — Initialise Git and push to GitHub

**4a. Initialise Git in your project folder:**

```bash
git init
git add .
git commit -m "feat: initial SocialSell platform"
```

**4b. Create a new repo on GitHub:**

1. Go to https://github.com/new
2. Name it `socialsell` (or whatever you want)
3. Set it to **Private**
4. **Do NOT** tick "Add README", "Add .gitignore", or "Choose licence"
   (you already have all of these)
5. Click **Create repository**

**4c. Copy the remote URL GitHub shows you, then run:**

```bash
git remote add origin https://github.com/YOUR-USERNAME/socialsell.git
git branch -M main
git push -u origin main
```

Refresh your GitHub repo page — all your files should be there.

---

## STEP 5 — Run the database migration in Supabase

Before deploying, the database needs the schema.

**Option A — Supabase Dashboard (quickest):**
1. Go to **Supabase Dashboard → Your Project → SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/20260622000000_initial_schema.sql`
4. Paste the entire contents into the editor
5. Click **Run**
6. You should see "Success. No rows returned"

**Option B — Supabase CLI (if you have it installed):**
```bash
supabase db push
```

> You only need to do this once. Future migration files you commit
> to `supabase/migrations/` will be picked up automatically if you've
> connected the Supabase GitHub integration.

---

## STEP 6 — Deploy to Vercel

**6a. Install Vercel CLI (one-time):**

```bash
npm install -g vercel
```

**6b. Log in to Vercel:**

```bash
vercel login
```

Follow the prompt — it opens a browser to authenticate.

**6c. Deploy:**

```bash
vercel
```

Vercel will ask you a few questions — answer like this:

```
? Set up and deploy "~/socialsell"?          → Y
? Which scope do you want to deploy to?      → your username
? Link to existing project?                  → N
? What's your project's name?                → socialsell
? In which directory is your code located?   → ./
? Want to modify these settings?             → N
```

Vercel auto-detects Create React App and sets:
- Build command: `npm run build`
- Output directory: `build`
- Install command: `npm install`

After ~60 seconds you'll get a preview URL like:
`https://socialsell-abc123.vercel.app`

**This is just a preview deploy — environment variables aren't set yet.**

---

## STEP 7 — Add environment variables in Vercel

Your app needs the Supabase keys (and later Stripe, Cloudinary, etc.)
to work properly in production.

**7a. Go to your Vercel dashboard:**
https://vercel.com/dashboard → click `socialsell` → **Settings** → **Environment Variables**

**7b. Add each variable from your `.env` file:**

Click **Add** for each one:

| Name | Value | Environment |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | your URL | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | your anon key | Production, Preview, Development |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | pk_live_... | Production only |
| `REACT_APP_PAYSTACK_PUBLIC_KEY` | pk_live_... | Production only |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | your cloud name | All |
| `REACT_APP_CLOUDINARY_PRESET_PUBLIC` | socialsell_public | All |
| `REACT_APP_CLOUDINARY_PRESET_PRIVATE` | socialsell_products | All |

> Add the rest from `.env.example` as you set up each service.
> For secret keys (Stripe secret, Paystack secret, Cloudinary API secret)
> these go in **Supabase Edge Function secrets**, NOT here — they must
> never touch the browser.

**7c. Redeploy to apply the variables:**

```bash
vercel --prod
```

Or trigger it from the Vercel dashboard:
**Deployments → your latest deploy → Redeploy**

---

## STEP 8 — Connect GitHub for automatic deploys

This means every `git push` auto-deploys — no manual steps.

1. Go to https://vercel.com/dashboard → `socialsell` → **Settings** → **Git**
2. Click **Connect Git Repository**
3. Authorise GitHub if prompted
4. Select your `socialsell` repo
5. Set **Production Branch** to `main`
6. Click **Save**

From now on:
- Push to `main` → **production deploy** (your live site)
- Push to any other branch → **preview deploy** (shareable test URL)

---

## STEP 9 — Set your production domain (optional but recommended)

1. Go to Vercel → `socialsell` → **Settings** → **Domains**
2. Click **Add**
3. Type your domain, e.g. `socialsell.app`
4. Vercel shows you DNS records to add
5. Go to your domain registrar (Namecheap, GoDaddy, etc.)
6. Add the records Vercel shows — usually an `A` record and a `CNAME`
7. Wait 5–30 minutes for DNS to propagate
8. Vercel auto-provisions an SSL certificate

---

## STEP 10 — Add the production URL to Supabase Auth

Supabase needs to know your domain to allow auth redirects.

1. **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to `https://yourdomain.com`
3. Under **Redirect URLs** add:
   ```
   https://yourdomain.com/**
   https://socialsell-*.vercel.app/**
   http://localhost:3000/**
   ```
4. Click **Save**

---

## Every-deploy workflow (going forward)

This is all you do for every change:

```bash
# 1. Make your changes in the code

# 2. Stage and commit
git add .
git commit -m "feat: add customer download page"

# 3. Push — Vercel auto-deploys within ~60 seconds
git push
```

For database changes, create a new migration file:

```bash
# Name format: YYYYMMDDHHMMSS_description.sql
# I'll always give you files named correctly — just commit them

git add supabase/migrations/
git commit -m "db: add customer_wishlists table"
git push
```

If you have Supabase GitHub integration enabled, migrations run automatically.
Otherwise, paste them into Supabase SQL Editor manually.

---

## Troubleshoot common issues

**Build fails on Vercel:**
```bash
# Test the build locally first
npm run build
# If it errors locally, fix it before pushing
```

**"Module not found" error:**
```bash
npm install
git add package-lock.json
git commit -m "fix: update lockfile"
git push
```

**Environment variables not working:**
- Make sure they start with `REACT_APP_` — React ignores anything else
- After adding/changing them in Vercel, you must redeploy
- Check spelling — they are case-sensitive

**Supabase auth not working on production:**
- Check you added your production URL to Supabase Auth redirect URLs (Step 10)
- Make sure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
  are set in Vercel environment variables

**Page refreshes give 404:**
- Go to Vercel → `socialsell` → Settings → General
- Under **Rewrites**, add: `Source: /(.*)`  `Destination: /index.html`
- Or create `public/vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## Full file structure recap

```
socialsell/                              ← git root
├── .gitignore                           ← ROOT
├── .env.example                         ← ROOT (commit this)
├── .env                                 ← ROOT (NEVER commit)
├── DEPLOYMENT.md                        ← ROOT
├── package.json                         ← ROOT
├── public/
│   └── index.html                       ← public/index.html
├── src/
│   ├── App.jsx                          ← src/App.jsx
│   ├── index.js                         ← src/index.js
│   ├── index.css                        ← src/index.css
│   ├── components/
│   │   ├── SuperAdmin.jsx
│   │   └── AffiliateDashboard.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   └── lib/
│       ├── supabase.js
│       ├── payments.js
│       ├── cloudinary.js
│       └── social/index.js
└── supabase/
    └── migrations/
        └── 20260622000000_initial_schema.sql  ← commit, run in Supabase
```

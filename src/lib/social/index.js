/**
 * SocialSell — Social Platform Integrations
 *
 * ALL OAuth flows must run through a server (Edge Function) because:
 *  - Client secrets must never be exposed in browser code
 *  - Access tokens are stored in the `social_accounts` table (encrypted)
 *
 * Flow for each platform:
 *  1. User clicks "Connect [Platform]"
 *  2. Browser → /functions/v1/oauth/[platform]/start  (gets auth URL)
 *  3. Redirect to platform's OAuth page
 *  4. Platform redirects back to /auth/social/callback?code=...&state=...
 *  5. Browser → /functions/v1/oauth/[platform]/callback (exchanges code for tokens)
 *  6. Tokens saved in social_accounts table
 *
 * Publishing flow:
 *  1. Seller creates/schedules a post in the UI
 *  2. Row inserted into scheduled_posts table
 *  3. Supabase pg_cron job (every 5 min) calls /functions/v1/publish-scheduled
 *  4. Edge Function reads due posts, calls each platform's API, updates status
 */

const BASE = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1`;
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("sb-access-token") || ""}`,
});

// ─── Generic OAuth helpers ─────────────────────────────────────────────────────

/** Start OAuth flow — opens platform auth page */
export async function connectPlatform(platform) {
  const res = await fetch(`${BASE}/oauth/${platform}/start`, { headers: authHeader() });
  if (!res.ok) throw new Error(`Failed to start ${platform} OAuth`);
  const { authUrl } = await res.json();
  window.location.href = authUrl;
}

/** Disconnect a platform */
export async function disconnectPlatform(platform) {
  const res = await fetch(`${BASE}/oauth/${platform}/disconnect`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error(`Failed to disconnect ${platform}`);
}

/** Publish a post (from scheduled_posts) immediately */
export async function publishNow(postId) {
  const res = await fetch(`${BASE}/publish-now`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ postId }),
  });
  if (!res.ok) throw new Error("Publish failed");
  return res.json();
}

// ─── META (Facebook + Instagram) ──────────────────────────────────────────────
/**
 * Meta developer setup:
 *  1. Go to https://developers.facebook.com/
 *  2. Create App → Business type
 *  3. Add products: Facebook Login, Instagram Basic Display, Instagram Graph API
 *  4. Required permissions:
 *     - pages_show_list
 *     - pages_read_engagement
 *     - pages_manage_posts
 *     - instagram_basic
 *     - instagram_content_publish
 *     - catalog_management
 *  5. Set Valid OAuth Redirect URIs: https://[your-project].supabase.co/functions/v1/oauth/meta/callback
 *
 * Edge Function environment variables:
 *   META_APP_ID         = your App ID
 *   META_APP_SECRET     = your App Secret
 */
export const meta = {
  SCOPES: [
    "pages_show_list",
    "pages_manage_posts",
    "instagram_basic",
    "instagram_content_publish",
    "catalog_management",
    "ads_management",       // for running ads
  ],

  /** Get insights for connected FB Page */
  getPageInsights: (pageId) =>
    `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_views_total,page_fan_count,page_post_engagements`,

  /** Create a FB Shop product (via catalog) */
  catalogProductBody: (product) => ({
    name:         product.name,
    description:  product.description,
    price:        Math.round(product.price_usd * 100),  // cents
    currency:     "USD",
    url:          `https://yourdomain.com/products/${product.slug}`,
    image_url:    product.cover_url,
    availability: "in stock",
    category:     "Software",
    condition:    "new",
  }),
};

// ─── TIKTOK ───────────────────────────────────────────────────────────────────
/**
 * TikTok developer setup:
 *  1. Go to https://developers.tiktok.com/
 *  2. Create App → My Apps
 *  3. Add Login Kit + Content Posting API
 *  4. Required scopes:
 *     - user.info.basic
 *     - video.upload
 *     - video.publish
 *  5. Redirect URI: https://[your-project].supabase.co/functions/v1/oauth/tiktok/callback
 *
 * Edge Function environment variables:
 *   TIKTOK_CLIENT_KEY    = your Client Key
 *   TIKTOK_CLIENT_SECRET = your Client Secret
 *
 * Note: TikTok Shop API requires separate approval at seller.tiktok.com
 */
export const tiktok = {
  SCOPES: ["user.info.basic", "video.upload", "video.publish"],

  /** Post a video to TikTok (two-step: init upload → publish) */
  UPLOAD_INIT_URL: "https://open.tiktokapis.com/v2/post/publish/video/init/",
  PUBLISH_URL:     "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
};

// ─── GOOGLE (YouTube + Google Business + Google Shopping) ─────────────────────
/**
 * Google developer setup:
 *  1. Go to https://console.cloud.google.com/
 *  2. Create project: "SocialSell"
 *  3. Enable APIs:
 *     - YouTube Data API v3  (for video publishing)
 *     - Google My Business API (for GBP posts)
 *     - Content API for Shopping (for Google Shopping)
 *  4. OAuth Consent Screen → External → add scopes
 *  5. Create OAuth Client ID (Web Application)
 *  6. Authorised redirect URI: https://[your-project].supabase.co/functions/v1/oauth/google/callback
 *
 * Edge Function environment variables:
 *   GOOGLE_CLIENT_ID     = your Client ID
 *   GOOGLE_CLIENT_SECRET = your Client Secret
 */
export const google = {
  SCOPES: [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/content",           // Google Shopping
    "https://www.googleapis.com/auth/business.manage",   // Google Business Profile
  ],

  MERCHANT_CENTER_API: "https://shoppingcontent.googleapis.com/content/v2.1",
  YOUTUBE_API:         "https://www.googleapis.com/upload/youtube/v3/videos",
};

// ─── X / TWITTER ──────────────────────────────────────────────────────────────
/**
 * X (Twitter) developer setup:
 *  1. Go to https://developer.twitter.com/
 *  2. Create Project + App → "SocialSell"
 *  3. App permissions: Read and Write
 *  4. Enable OAuth 2.0 with PKCE
 *  5. Callback URL: https://[your-project].supabase.co/functions/v1/oauth/twitter/callback
 *  6. Required scopes:
 *     - tweet.read
 *     - tweet.write
 *     - users.read
 *     - media.write (for image uploads)
 *
 * Edge Function environment variables:
 *   TWITTER_CLIENT_ID     = your OAuth 2.0 Client ID
 *   TWITTER_CLIENT_SECRET = your OAuth 2.0 Client Secret
 *
 * Note: You need Elevated access or a paid plan for higher tweet volumes.
 */
export const twitter = {
  SCOPES: ["tweet.read", "tweet.write", "users.read", "media.write", "offline.access"],
  API_BASE: "https://api.twitter.com/2",

  /** Build tweet body with product link */
  buildTweet: (caption, productUrl) => ({
    text: `${caption}\n\n${productUrl}`.substring(0, 280),
  }),
};

// ─── PINTEREST ────────────────────────────────────────────────────────────────
/**
 * Pinterest developer setup:
 *  1. Go to https://developers.pinterest.com/
 *  2. Create App → My Apps → New App
 *  3. Required scopes:
 *     - boards:read
 *     - boards:write
 *     - pins:read
 *     - pins:write
 *     - catalogs:read
 *     - catalogs:write
 *  4. Redirect URI: https://[your-project].supabase.co/functions/v1/oauth/pinterest/callback
 *
 * Edge Function environment variables:
 *   PINTEREST_APP_ID     = your App ID
 *   PINTEREST_APP_SECRET = your App Secret
 */
export const pinterest = {
  SCOPES: ["boards:read", "boards:write", "pins:read", "pins:write", "catalogs:read", "catalogs:write"],
  API_BASE: "https://api.pinterest.com/v5",

  /** Build a Product Pin */
  buildPin: (product, boardId) => ({
    board_id:    boardId,
    title:       product.name,
    description: product.description,
    link:        `https://yourdomain.com/products/${product.slug}`,
    media_source: {
      source_type: "image_url",
      url:         product.cover_url,
    },
    shopping_retargeting: {
      lookback_window: 30,
      tag_types: [0, 1],
      exclusion_upper_bound: 30,
    },
  }),
};

// ─── Platform metadata (used in UI) ──────────────────────────────────────────
export const PLATFORM_META = {
  meta:      { name: "Meta",      label: "Facebook & Instagram", icon: "📘", color: "#1877F2", bg: "#E8F0FE" },
  tiktok:    { name: "TikTok",    label: "TikTok Shop & Ads",   icon: "🎵", color: "#010101", bg: "#F5F5F5" },
  google:    { name: "Google",    label: "Shopping & YouTube",   icon: "🔍", color: "#4285F4", bg: "#E8F0FE" },
  twitter:   { name: "X/Twitter", label: "Posts & Threads",      icon: "🐦", color: "#1DA1F2", bg: "#E7F5FD" },
  pinterest: { name: "Pinterest", label: "Product Pins",         icon: "📌", color: "#E60023", bg: "#FDEDF0" },
  youtube:   { name: "YouTube",   label: "Video & Shorts",       icon: "▶️", color: "#FF0000", bg: "#FFF0F0" },
};

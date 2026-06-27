/**
 * SocialSell — Payments
 *
 * Strategy:
 *  - Stripe  → US, EU, UK, CA, AU and most of the world
 *  - Paystack → NG, GH, KE, ZA, EG (better local rails, NGN/GHS/KES support)
 *
 * Detecting which to use: by buyer's currency preference (set in their profile).
 * Both are wired through Supabase Edge Functions so secret keys never touch the client.
 */

import { loadStripe } from "@stripe/stripe-js";

// ─── Config ───────────────────────────────────────────────────────────────────
export const STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
export const PAYSTACK_PK = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;

// Currencies handled by Paystack
export const PAYSTACK_CURRENCIES = new Set(["NGN", "GHS", "KES", "ZAR", "EGP"]);

// Platform fee percentage (mirrors platform_settings in DB)
export const PLATFORM_FEE_PCT = 5;

// ─── Stripe ───────────────────────────────────────────────────────────────────
let _stripePromise = null;
const getStripe = () => {
  if (!_stripePromise) _stripePromise = loadStripe(STRIPE_PK);
  return _stripePromise;
};

/**
 * Create a Stripe Checkout Session (via Supabase Edge Function)
 * and redirect the buyer.
 */
export async function stripeCheckout({ productId, priceUsd, currency, buyerEmail, affiliateCode }) {
  // Call your Supabase Edge Function: /functions/v1/stripe-checkout
  const res = await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, priceUsd, currency, buyerEmail, affiliateCode }),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  const { sessionId } = await res.json();

  const stripe = await getStripe();
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw error;
}

/**
 * Stripe webhook handler (runs in Edge Function, NOT in browser)
 * Place this logic in: supabase/functions/stripe-webhook/index.ts
 */
export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",   // → mark order paid, trigger download email
  "payment_intent.payment_failed", // → mark order failed
  "account.updated",               // → refresh Stripe Connect status
];

// ─── Paystack ─────────────────────────────────────────────────────────────────
/**
 * Initialize a Paystack inline payment.
 * Paystack's JS SDK loads globally — this wrapper makes it Promise-based.
 */
export function paystackCheckout({ amountInKobo, currency, email, productName, metadata, onSuccess, onClose }) {
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      // Lazy-load Paystack JS
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => initPaystack();
      script.onerror = () => reject(new Error("Failed to load Paystack SDK"));
      document.head.appendChild(script);
    } else {
      initPaystack();
    }

    function initPaystack() {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PK,
        email,
        amount: amountInKobo,            // Paystack uses kobo/pesewas/cents
        currency,
        ref: `SELL_${Date.now()}`,
        metadata: {
          ...metadata,
          custom_fields: [{ display_name: "Product", variable_name: "product", value: productName }],
        },
        callback: (response) => {
          resolve(response);
          if (onSuccess) onSuccess(response);
        },
        onClose: () => {
          if (onClose) onClose();
        },
      });
      handler.openIframe();
    }
  });
}

/**
 * Verify Paystack payment server-side (runs in Edge Function)
 * supabase/functions/paystack-verify/index.ts
 */
export const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

// ─── Universal checkout ────────────────────────────────────────────────────────
/**
 * Chooses Stripe or Paystack based on the buyer's currency.
 * This is what your Checkout component calls.
 */
export async function checkout({ product, buyer, currency, affiliateCode }) {
  if (PAYSTACK_CURRENCIES.has(currency)) {
    // Convert USD price to local currency (use latest exchange rate from your DB or Fixer.io)
    const rate = await getExchangeRate(currency);
    const localAmount = Math.round(product.price_usd * rate);
    const amountInSubunit = localAmount * 100; // kobo / pesewas

    return paystackCheckout({
      amountInKobo: amountInSubunit,
      currency,
      email: buyer.email,
      productName: product.name,
      metadata: {
        product_id: product.id,
        store_id: product.store_id,
        buyer_id: buyer.id,
        affiliate_code: affiliateCode,
      },
    });
  } else {
    return stripeCheckout({
      productId: product.id,
      priceUsd: product.price_usd,
      currency,
      buyerEmail: buyer.email,
      affiliateCode,
    });
  }
}

// ─── Exchange rates ────────────────────────────────────────────────────────────
/** Fetch exchange rate — cache in sessionStorage for 1 hour */
export async function getExchangeRate(toCurrency, fromCurrency = "USD") {
  if (toCurrency === fromCurrency) return 1;
  const cacheKey = `fx_${fromCurrency}_${toCurrency}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { rate, ts } = JSON.parse(cached);
    if (Date.now() - ts < 3_600_000) return rate;
  }

  // Free tier: exchangerate.host or open.er-api.com
  const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
  const json = await res.json();
  const rate = json.rates[toCurrency];
  sessionStorage.setItem(cacheKey, JSON.stringify({ rate, ts: Date.now() }));
  return rate;
}

// ─── Supabase Edge Functions you need to create ───────────────────────────────
/**
 * 1. supabase/functions/stripe-checkout/index.ts
 *    - Receives { productId, priceUsd, currency, buyerEmail, affiliateCode }
 *    - Creates Stripe Checkout Session with:
 *        - application_fee_amount = price * PLATFORM_FEE_PCT / 100 (Stripe Connect)
 *        - transfer_data.destination = store.stripe_account_id
 *        - success_url, cancel_url
 *    - Returns { sessionId }
 *
 * 2. supabase/functions/stripe-webhook/index.ts
 *    - Verifies Stripe-Signature header
 *    - On checkout.session.completed → insert order, send download email
 *
 * 3. supabase/functions/paystack-verify/index.ts
 *    - Receives { reference, productId, buyerId }
 *    - Calls Paystack /transaction/verify/:reference with secret key
 *    - On success → insert order
 *
 * 4. supabase/functions/send-download/index.ts
 *    - Sends buyer a secure signed Cloudinary URL (1-hour expiry) via email
 */

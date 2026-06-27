import { createClient } from "@supabase/supabase-js";

// ─── Client ──────────────────────────────────────────────────────────────────
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const auth = {
  /** Sign up with email + password. Sends confirmation email. */
  signUp: async ({ email, password, displayName, role = "customer" }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, role },
      },
    });
    if (error) throw error;
    return data;
  },

  /** Sign in with email + password */
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign in with OAuth provider (Google, Facebook) */
  signInWithProvider: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  },

  /** Sign out */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get current session */
  getSession: () => supabase.auth.getSession(),

  /** Get current user */
  getUser: () => supabase.auth.getUser(),

  /** Reset password email */
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) throw error;
  },

  /** Update password (after reset) */
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  /** Listen to auth state changes */
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

// ─── Profile helpers ──────────────────────────────────────────────────────────
export const profiles = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, stores(*)")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Products helpers ─────────────────────────────────────────────────────────
export const productsDB = {
  list: async ({ storeId, status, type, limit = 50, offset = 0 } = {}) => {
    let q = supabase
      .from("products")
      .select("*, stores(name, slug, logo_url)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (storeId) q = q.eq("store_id", storeId);
    if (status)  q = q.eq("status", status);
    if (type)    q = q.eq("type", type);

    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  get: async (id) => {
    const { data, error } = await supabase
      .from("products")
      .select("*, stores(*, profiles(display_name, avatar_url)), reviews(rating, title, body, created_at, profiles(display_name, avatar_url))")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (product) => {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Orders helpers ────────────────────────────────────────────────────────────
export const ordersDB = {
  create: async (order) => {
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateStatus: async (id, status, extra = {}) => {
    const { data, error } = await supabase
      .from("orders")
      .update({ status, ...extra })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  listForBuyer: async (buyerId) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, products(name, cover_url, file_url), stores(name)")
      .eq("buyer_id", buyerId)
      .eq("status", "paid")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  listForStore: async (storeId) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, products(name), profiles!buyer_id(display_name, avatar_url)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Super admin: all orders with pagination
  listAll: async ({ limit = 100, offset = 0, status } = {}) => {
    let q = supabase
      .from("orders")
      .select("*, products(name), stores(name), profiles!buyer_id(display_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (status) q = q.eq("status", status);
    const { data, error, count } = await q;
    if (error) throw error;
    return { data, count };
  },
};

// ─── Platform settings (super admin) ─────────────────────────────────────────
export const settingsDB = {
  getAll: async () => {
    const { data, error } = await supabase.from("platform_settings").select("*");
    if (error) throw error;
    return Object.fromEntries(data.map(r => [r.key, r.value]));
  },

  set: async (key, value, userId) => {
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key, value, updated_by: userId, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
};

// ─── Realtime subscriptions ───────────────────────────────────────────────────
export const subscriptions = {
  /** Listen for new orders on a store */
  storeOrders: (storeId, callback) =>
    supabase
      .channel(`store-orders-${storeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `store_id=eq.${storeId}` }, callback)
      .subscribe(),

  /** Listen for platform-wide new orders (super admin) */
  allOrders: (callback) =>
    supabase
      .channel("all-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, callback)
      .subscribe(),
};

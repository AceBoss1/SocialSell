import { useState, useEffect, createContext, useContext } from "react";
import { supabase, auth, profiles } from "../lib/supabase";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const p = await profiles.get(userId);
      setProfile(p);
    } catch (e) {
      console.error("Profile load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin:    profile?.role === "super_admin",
    isVendor:        profile?.role === "vendor" || profile?.role === "super_admin",
    store:           profile?.stores?.[0] ?? null,
    // Actions
    signUp:   (opts) => auth.signUp(opts),
    signIn:   (opts) => auth.signIn(opts),
    signOut:  ()     => auth.signOut().then(() => { setUser(null); setProfile(null); }),
    signInWithGoogle:   () => auth.signInWithProvider("google"),
    signInWithFacebook: () => auth.signInWithProvider("facebook"),
    refreshProfile: () => user && loadProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

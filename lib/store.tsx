"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getDB } from "./db";
import type { Profile, WorkEntry, NewWorkEntry } from "./types";

interface StoreValue {
  ready: boolean;
  mode: "local" | "cloud";
  profile: Profile | null; // signed-in user
  profiles: Profile[];
  entries: WorkEntry[];
  signIn: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  addEntry: (e: NewWorkEntry) => Promise<void>;
  updateEntry: (id: string, patch: Partial<NewWorkEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  upsertProfile: (p: Profile) => Promise<void>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const db = useMemo(() => getDB(), []);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const loadedRef = useRef(false);

  const loadData = useCallback(async () => {
    const [ps, es] = await Promise.all([db.getProfiles(), db.getEntries()]);
    setProfiles(ps);
    setEntries(es);
  }, [db]);

  const refresh = useCallback(async () => {
    await loadData();
    const p = await db.getCurrentProfile();
    setProfile(p);
  }, [db, loadData]);

  // Initial load + session restore
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const p = await db.getCurrentProfile();
        setProfile(p);
        await loadData();
      } catch (e) {
        console.error("Store init failed", e);
      } finally {
        setReady(true);
      }
    })();
  }, [db, loadData]);

  // Live updates (cross-tab locally, cross-device via Supabase realtime)
  useEffect(() => {
    const unsub = db.onChange(() => {
      loadData().catch(console.error);
    });
    return unsub;
  }, [db, loadData]);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const res = await db.signIn(username, password);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        await loadData();
      }
      return { ok: res.ok, error: res.error };
    },
    [db, loadData]
  );

  const signOut = useCallback(async () => {
    await db.signOut();
    setProfile(null);
  }, [db]);

  const addEntry = useCallback(
    async (e: NewWorkEntry) => {
      await db.addEntry(e);
      await loadData();
    },
    [db, loadData]
  );

  const updateEntry = useCallback(
    async (id: string, patch: Partial<NewWorkEntry>) => {
      await db.updateEntry(id, patch);
      await loadData();
    },
    [db, loadData]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await db.deleteEntry(id);
      await loadData();
    },
    [db, loadData]
  );

  const upsertProfile = useCallback(
    async (p: Profile) => {
      await db.upsertProfile(p);
      await loadData();
    },
    [db, loadData]
  );

  const value: StoreValue = {
    ready,
    mode: db.mode,
    profile,
    profiles,
    entries,
    signIn,
    signOut,
    addEntry,
    updateEntry,
    deleteEntry,
    upsertProfile,
    refresh,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "./supabase/client";
import { useLearn } from "./learn-store";

const STORAGE_KEY = "lisan.state.v2";
const OWNER_KEY = "lisan.state.owner.v1";

export default function CloudSync() {
  const { state, hydrated, replaceState, resetForAccount } = useLearn();
  const [userId, setUserId] = useState(null);
  const [ready, setReady] = useState(false);
  const generation = useRef(0);

  useEffect(() => {
    if (!hydrated) return undefined;

    const supabase = createClient();

    async function syncSession(session) {
      const current = ++generation.current;
      const nextUserId = session?.user?.id;
      if (!nextUserId) {
        setUserId(null);
        setReady(false);
        return;
      }

      setUserId(nextUserId);
      setReady(false);

      try {
        const response = await fetch("/api/learner-state", { method: "GET", cache: "no-store" });
        if (!response.ok) return;
        const remote = await response.json();
        if (generation.current !== current) return;

        if (remote.state) {
          replaceState(remote.state);
          window.localStorage.setItem(OWNER_KEY, nextUserId);
          setReady(true);
          return;
        }

        const previousOwner = window.localStorage.getItem(OWNER_KEY);
        if (previousOwner && previousOwner !== nextUserId) {
          // Never copy one account's local learning data into another account.
          resetForAccount();
          window.localStorage.setItem(OWNER_KEY, nextUserId);
          setReady(true);
          return;
        }

        const raw = window.localStorage.getItem(STORAGE_KEY);
        let initialState = state;
        if (raw) {
          try {
            initialState = JSON.parse(raw);
          } catch {
            return;
          }
        }

        const save = await fetch("/api/learner-state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: initialState }),
        });
        if (!save.ok || generation.current !== current) return;
        replaceState(initialState);
        window.localStorage.setItem(OWNER_KEY, nextUserId);
        setReady(true);
      } catch {
        // Keep local-first learning available if Supabase is temporarily offline.
        setReady(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (["INITIAL_SESSION", "SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
        queueMicrotask(() => { void syncSession(session); });
      }
    });

    return () => {
      generation.current += 1;
      subscription.unsubscribe();
    };
  }, [hydrated, replaceState, resetForAccount]);

  useEffect(() => {
    if (!hydrated || !userId || !ready) return undefined;
    const timer = window.setTimeout(() => {
      void fetch("/api/learner-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      }).then((response) => {
        if (response.ok) window.localStorage.setItem(OWNER_KEY, userId);
      }).catch(() => {
        // The local copy remains authoritative until the next successful sync.
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [state, hydrated, userId, ready]);

  return null;
}

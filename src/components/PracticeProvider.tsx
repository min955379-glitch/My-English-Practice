"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  Fragment,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { emptyData, readData, writeData } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { LearnerData } from "@/lib/types";
import { scheduleReview } from "@/lib/learning";

type Context = {
  data: LearnerData;
  ready: boolean;
  user: User | null;
  storageError: string;
  syncState: string;
  update: (fn: (data: LearnerData) => LearnerData) => void;
  sync: () => Promise<void>;
  online: boolean;
};
const PracticeContext = createContext<Context | null>(null);
export function PracticeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LearnerData>(() => emptyData());
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [storageError, setStorageError] = useState("");
  const [online, setOnline] = useState(true);
  const [syncState, setSyncState] = useState("On-device practice");
  const current = useRef(data);
  const scope = useRef("local");
  const writeChain = useRef(Promise.resolve());
  const generation = useRef(0);
  useEffect(() => {
    let alive = true;
    const load = async (account: User | null) => {
      const g = ++generation.current;
      setReady(false);
      await writeChain.current;
      scope.current = account ? `user:${account.id}` : "local";
      let saved = emptyData();
      try {
        saved = await readData(scope.current);
      } catch {
        setStorageError(
          "This browser cannot save progress. Keep this tab open, or export your progress in Settings.",
        );
      }
      if (alive && g === generation.current) {
        current.current = saved;
        setData(saved);
        setUser(account);
        setReady(true);
      }
    };
    if (supabase) {
      supabase.auth
        .getSession()
        .then(({ data }) => load(data.session?.user ?? null));
    } else {
      void load(null);
    }
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT")
        void load(session?.user ?? null);
    });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    return () => {
      alive = false;
      subscription?.data.subscription.unsubscribe();
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, []);
  const update = useCallback((fn: (data: LearnerData) => LearnerData) => {
    const next = fn(current.current);
    current.current = next;
    setData(next);
    const key = scope.current;
    writeChain.current = writeChain.current
      .then(() => writeData(next, key))
      .catch(() =>
        setStorageError(
          "Your latest progress could not be saved. Export a copy from Settings before closing this tab.",
        ),
      );
  }, []);
  const sync = useCallback(async () => {
    if (!supabase || !user) {
      setSyncState("Sign in to sync across devices");
      return;
    }
    if (!navigator.onLine) {
      setSyncState("Offline — progress stays on this device");
      return;
    }
    setSyncState("Syncing…");
    const g = generation.current;
    try {
      const { data: auth } = await supabase.auth.getSession();
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.session?.access_token ?? ""}`,
        },
        body: JSON.stringify(current.current),
      });
      if (!response.ok) throw new Error("sync");
      const merged = (await response.json()) as LearnerData;
      if (generation.current !== g) return;
      update((latest) => {
        const attempts = [
          ...new Map(
            [...merged.attempts, ...latest.attempts].map((a) => [a.id, a]),
          ).values(),
        ].sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));
        const reviews: LearnerData["reviews"] = {};
        for (const attempt of attempts)
          reviews[attempt.wordId] = scheduleReview(
            reviews[attempt.wordId],
            attempt,
            latest.settings.timezone,
          );
        return {
          ...latest,
          attempts,
          sessions: [
            ...new Map(
              [...merged.sessions, ...latest.sessions].map((s) => [s.id, s]),
            ).values(),
          ],
          reviews,
        };
      });
      setSyncState("Synced with your account");
    } catch {
      setSyncState(
        "Could not sync — your on-device progress is safe. Try again later.",
      );
    }
  }, [user, update]);
  useEffect(() => {
    if (ready && user && online) {
      const task = setTimeout(() => void sync(), 0);
      return () => clearTimeout(task);
    }
  }, [ready, user, online, sync]);
  return (
    <PracticeContext.Provider
      value={{
        data,
        ready,
        user,
        storageError,
        online,
        update,
        syncState,
        sync,
      }}
    >
      <Fragment key={user?.id ?? "local"}>{children}</Fragment>
    </PracticeContext.Provider>
  );
}
export function usePractice() {
  const context = useContext(PracticeContext);
  if (!context) throw new Error("PracticeProvider is missing");
  return context;
}

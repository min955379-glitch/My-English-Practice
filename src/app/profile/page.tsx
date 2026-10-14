"use client";
import { useRef, useState } from "react";
import { usePractice } from "@/components/PracticeProvider";
import { supabase, cloudConfigured } from "@/lib/supabase";
import { emptyData } from "@/lib/storage";
import { isLearnerData } from "@/lib/validation";
import { useSpeech } from "@/hooks/useSpeech";
import { Icon } from "@/components/ui/Icon";
export default function ProfilePage() {
  const { data, ready, update, user, online, sync, syncState, storageError } =
    usePractice();
  const speech = useSpeech();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const file = useRef<HTMLInputElement>(null);
  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result =
        authMode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      setMessage(
        result.error
          ? result.error.message
          : authMode === "signup"
            ? "Check your email if confirmation is required. Your on-device practice remains separate from account practice."
            : "You are signed in. Use Sync now to retrieve your account progress.",
      );
      setPassword("");
    } finally {
      setBusy(false);
    }
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-practice-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importData = async (selected: File) => {
    try {
      if (selected.size > 2_000_000) throw new Error("too large");
      const value = JSON.parse(await selected.text()) as unknown;
      if (!isLearnerData(value)) throw new Error("invalid");
      update((d) => ({
        ...d,
        attempts: [
          ...new Map(
            [...d.attempts, ...value.attempts].map((a) => [a.id, a]),
          ).values(),
        ],
        sessions: [
          ...new Map(
            [...d.sessions, ...value.sessions].map((s) => [s.id, s]),
          ).values(),
        ],
        reviews: { ...d.reviews, ...value.reviews },
      }));
      setMessage("Progress imported. Your current settings have been kept.");
    } catch {
      setMessage(
        "That file could not be imported. Choose an unmodified progress export from this website.",
      );
    }
  };
  const deleteAccount = async () => {
    if (!supabase || !user) return;
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.session?.access_token}`,
          "x-confirm-delete": "delete-my-account",
        },
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error);
        return;
      }
      update(() => emptyData());
      await supabase.auth.signOut();
      setMessage(
        "Your account and associated cloud progress have been deleted.",
      );
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  };
  if (!ready)
    return (
      <div className="page-container">
        <p>Loading your settings…</p>
      </div>
    );
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Make this space your own</p>
        <h1>Your practice, your preferences.</h1>
        <p className="lead">
          A comfortable routine. A voice you recognise. Progress that stays
          yours.
        </p>
      </div>
      {(message || storageError) && (
        <p role="status" className="notice">
          {message || storageError}
        </p>
      )}
      <div className="settings-grid">
        <section className="panel settings-panel">
          <h2>Practice preferences</h2>
          <label className="field-label">
            Your daily aim
            <select
              value={data.settings.dailyTargetMinutes}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  settings: {
                    ...d.settings,
                    dailyTargetMinutes: Number(e.target.value),
                  },
                }))
              }
            >
              {[15, 20, 25].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            British English voice
            <select
              value={data.settings.preferredVoice}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  settings: { ...d.settings, preferredVoice: e.target.value },
                }))
              }
            >
              <option value="">Choose automatically</option>
              {speech.voices
                .filter(
                  (v) => v.lang.toLowerCase().replace("_", "-") === "en-gb",
                )
                .map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                  </option>
                ))}
            </select>
          </label>
          <p className="small muted">
            Voices come from your browser or device. If none are listed, install
            a British English voice in your device settings.
          </p>
          <label className="field-label">
            Slow playback speed
            <select
              value={data.settings.slowRate}
              onChange={(e) =>
                update((d) => ({
                  ...d,
                  settings: { ...d.settings, slowRate: Number(e.target.value) },
                }))
              }
            >
              {[0.6, 0.65, 0.75].map((n) => (
                <option key={n} value={n}>
                  {n === 0.6
                    ? "Extra slow"
                    : n === 0.65
                      ? "Gentle (recommended)"
                      : "A little quicker"}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-outline"
            onClick={() =>
              speech.speak("A little practice, a little more confidence.", true)
            }
          >
            <Icon name="volume" />
            Try this voice
          </button>
          {speech.message && <p className="notice small">{speech.message}</p>}
          <p className="small muted">
            Settings are saved as you change them. Daily boundaries use{" "}
            {data.settings.timezone}.
          </p>
        </section>
        <section className="panel settings-panel">
          <h2>Account & cloud sync</h2>
          {!cloudConfigured ? (
            <div className="cloud-empty">
              <Icon name="lock" />
              <h3>Private, on-device practice</h3>
              <p>
                Cloud accounts are not configured on this installation. All
                practice features work without an account.
              </p>
              <p className="small muted">
                To enable accounts, the site operator needs to configure
                Supabase and apply the database migrations. Export a copy of
                your progress below.
              </p>
            </div>
          ) : user ? (
            <>
              <p>
                Signed in as <strong>{user.email}</strong>
              </p>
              <p className="muted">{syncState}</p>
              <button
                className="button button-primary"
                onClick={() => void sync()}
                disabled={!online}
              >
                Sync now
              </button>
              <button
                className="button button-outline"
                onClick={() => {
                  void supabase?.auth.signOut();
                }}
              >
                Sign out
              </button>
              <p className="small muted">
                Account progress and guest progress are kept separate on shared
                devices. Export guest progress first if you want to import it
                into your account.
              </p>
            </>
          ) : (
            <form onSubmit={authenticate} className="account-form">
              <div className="button-row">
                <button
                  type="button"
                  className={authMode === "signin" ? "tab active" : "tab"}
                  onClick={() => setAuthMode("signin")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={authMode === "signup" ? "tab active" : "tab"}
                  onClick={() => setAuthMode("signup")}
                >
                  Create account
                </button>
              </div>
              <label className="field-label">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="field-label">
                Password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    authMode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="button button-primary" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : authMode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
              <p className="small muted">
                Guest progress stays on this device. Export it before signing in
                if you want to transfer it.
              </p>
            </form>
          )}
        </section>
        <section className="panel settings-panel">
          <h2>Keep a copy of your progress</h2>
          <p className="muted">
            Export your attempts, sessions and review schedule. Import the file
            on another device whenever you need it.
          </p>
          <div className="button-row">
            <button className="button button-outline" onClick={exportData}>
              <Icon name="download" />
              Export progress
            </button>
            <button
              className="button button-outline"
              onClick={() => file.current?.click()}
            >
              Import progress
            </button>
            <input
              ref={file}
              type="file"
              aria-label="Import a progress backup file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importData(f);
                e.target.value = "";
              }}
            />
          </div>
        </section>
        <section className="panel settings-panel">
          <h2>A fresh start</h2>
          <p className="muted">
            Clearing progress cannot be undone. Export a copy first. Clearing
            this device does not delete a cloud backup.
          </p>
          {!confirm ? (
            <button className="text-button" onClick={() => setConfirm(true)}>
              Show deletion options
            </button>
          ) : (
            <>
              <p className="notice">
                Please confirm only if you want to permanently remove this
                progress.
              </p>
              <div className="button-row">
                <button
                  className="button button-outline"
                  onClick={() => {
                    update(() => emptyData());
                    setConfirm(false);
                    setMessage(
                      "Progress on this device has been cleared. Cloud progress was not deleted.",
                    );
                  }}
                >
                  Clear this device
                </button>
                {user && (
                  <button
                    className="button button-outline"
                    disabled={busy}
                    onClick={() => void deleteAccount()}
                  >
                    Delete my account & cloud data
                  </button>
                )}
                <button
                  className="text-button"
                  onClick={() => setConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

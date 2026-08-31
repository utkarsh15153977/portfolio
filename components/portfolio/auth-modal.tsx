"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { usePrefersReducedMotion } from "@/hooks/use-preferences";
import { useSystem } from "@/components/providers/system-provider";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
  initialEmail?: string;
}

export function AuthModal({
  open,
  onClose,
  initialMode = "login",
  initialEmail = "",
}: AuthModalProps) {
  const { setScrollLocked } = useSystem();
  const reduced = usePrefersReducedMotion();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync props when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setEmail(initialEmail);
      setName("");
      setPassword("");
      setError(null);
      setSuccess(null);
    }
  }, [open, initialMode, initialEmail]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [open, setScrollLocked]);

  // Focus management
  useDialogFocus(open, overlayRef);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const resetFields = useCallback(() => {
    setName("");
    setPassword("");
    setError(null);
    setSuccess(null);
  }, []);

  const switchMode = useCallback(() => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    resetFields();
  }, [resetFields]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "register") {
        await register(email, name, password);
        setSuccess("Account created. Please sign in.");
        setMode("login");
        setPassword("");
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.status) {
          case 400: {
            const body = err.body as Record<string, unknown> | undefined;
            const errors = body?.errors as Record<string, string> | undefined;
            if (errors) {
              setError(Object.values(errors).join(". "));
            } else {
              setError(err.message || "Invalid request");
            }
            break;
          }
          case 401:
            setError("Invalid email or password");
            break;
          case 409:
            setError("Email already registered");
            break;
          case 429:
            setError("Too many attempts. Please try again later.");
            break;
          case 0:
            setError("Could not reach the server. Is the backend running?");
            break;
          default:
            setError(err.message || "Something went wrong");
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in" : "Create account"}
      tabIndex={-1}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/[0.97] grid-bg noise",
        "transition-opacity duration-300",
        reduced ? "" : ""
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,7,11,0.9)_100%)]" />

      <div className="relative w-[min(92vw,440px)] px-6">
        {/* Header */}
        <p className="mb-2 font-mono text-[10px] tracking-[0.3em] text-accent/70">
          {mode === "login" ? "AUTHENTICATE" : "REGISTER NEW USER"}
        </p>
        <h2 className="mb-1 font-display text-lg font-bold tracking-[0.18em] text-ink">
          {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </h2>
        <p className="mb-6 font-mono text-[10px] tracking-widest text-ink-faint">
          {mode === "login"
            ? "ENTER CREDENTIALS TO ACCESS PROTECTED FEATURES"
            : "REGISTER TO ACCESS AI LAB AND MORE"}
        </p>

        {/* Success message */}
        {success && (
          <div className="mb-4 border border-ok/35 bg-ok/[0.06] p-3">
            <p className="font-mono text-[11px] tracking-[0.14em] text-ok">
              <span aria-hidden="true">✓ </span>
              {success}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 border border-warn/35 bg-warn/[0.06] p-3">
            <p className="font-mono text-[11px] tracking-[0.14em] text-warn">
              <span aria-hidden="true">▲ </span>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (register only) */}
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-name"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
              >
                NAME *
              </label>
              <input
                id="auth-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Utkarsh"
                disabled={loading}
                className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none disabled:opacity-60"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
            >
              EMAIL *
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={loading}
              className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
            >
              PASSWORD *
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim() || (mode === "register" && !name.trim())}
            className="inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3.5 font-mono text-xs font-bold tracking-[0.25em] text-background transition-all duration-200 hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full bg-background/60 animate-pulse-dot" />
                {mode === "login" ? "SIGNING IN..." : "CREATING..."}
              </span>
            ) : mode === "login" ? (
              "SIGN IN"
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
            className="font-mono text-[10px] tracking-[0.2em] text-ink-faint underline-offset-4 transition-colors hover:text-ink-dim hover:underline disabled:opacity-60"
          >
            {mode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Close hint */}
        <p className="mt-4 text-center font-mono text-[9px] tracking-[0.2em] text-ink-faint/60">
          ESC TO CLOSE
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/portfolio/auth-modal";

export function AuthStatus() {
  const { user, loading, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 w-16 animate-pulse bg-surface-2" />
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="space-y-2">
          <p className="font-mono text-[9px] tracking-[0.22em] text-ink-faint">
            SIGNED IN AS
          </p>
          <p className="font-mono text-[10px] tracking-[0.16em] text-accent truncate">
            {user.email}
          </p>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 border border-line px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-ink-faint transition-colors hover:border-warn/50 hover:text-warn"
          >
            <span className="inline-block size-1 rounded-full bg-warn/60" aria-hidden />
            LOGOUT
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-mono text-[9px] tracking-[0.22em] text-ink-faint">
            AUTH STATUS
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 border border-accent/40 bg-accent-soft px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-background"
          >
            <span className="inline-block size-1 rounded-full bg-ok animate-pulse-dot" aria-hidden />
            LOGIN
          </button>
        </div>
      )}

      <AuthModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

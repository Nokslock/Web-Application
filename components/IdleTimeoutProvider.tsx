"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { toast } from "sonner";
import { clearVaultKey } from "@/lib/vaultKeyManager";

// 4 hours in milliseconds
const IDLE_TIMEOUT_MS = 4 * 60 * 60 * 1000;
// Check every 60 seconds
const CHECK_INTERVAL_MS = 60 * 1000;

export default function IdleTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      clearVaultKey();
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();

      // Also clear the server-side cookie via API
      await fetch("/api/auth/sign-out", { method: "POST" });

      toast.info("You've been signed out due to inactivity.", {
        duration: 5000,
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Idle timeout sign-out error:", error);
      // Force redirect even if sign-out fails
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Set initial activity timestamp
    lastActivityRef.current = Date.now();

    // Activity events to listen for
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    // Throttle activity updates to avoid excessive processing
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const throttledReset = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        resetActivity();
        throttleTimer = null;
      }, 1000); // Throttle to once per second
    };

    // Attach event listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledReset, { passive: true });
    });

    // Periodic check for idle timeout
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        handleLogout();
      }
    }, CHECK_INTERVAL_MS);

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledReset);
      });
      clearInterval(intervalId);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [resetActivity, handleLogout]);

  return <>{children}</>;
}

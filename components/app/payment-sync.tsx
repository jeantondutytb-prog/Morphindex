"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentSync({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function sync() {
      while (!cancelled && attempts < 12) {
        attempts += 1;
        try {
          const res = await fetch(
            `/api/stripe/sync-session?session_id=${encodeURIComponent(sessionId)}`,
          );
          if (res.ok) {
            if (!cancelled) {
              setStatus("done");
              router.refresh();
            }
            return;
          }
        } catch {
          // retry
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!cancelled) setStatus("error");
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  if (status === "done") return null;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm mb-4 ${
        status === "error"
          ? "border-line-strong bg-bg/40 text-muted"
          : "border-accent/30 bg-accent/10 text-accent"
      }`}
    >
      {status === "error"
        ? "Le paiement a bien été reçu mais la confirmation prend du temps. Recharge la page dans quelques instants ou contacte le support si le problème persiste."
        : "Confirmation du paiement en cours…"}
    </div>
  );
}

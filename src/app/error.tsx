"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui";

export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      message={
        error.message ||
        "Could not reach the graph database. Check that your CognoDB instance is running and .env.local is set."
      }
      retryHref="/"
    />
  );
}

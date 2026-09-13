"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  creatorInitMessage,
  isTrustedArchWalkMessage,
  tokenAppearsInUrl,
} from "@/lib/archwalk/protocol";

type SessionPayload = {
  sessionApiId: string;
  token: string;
  creatorOrigin: string;
  creatorUrl: string;
};

export function CreatorEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const tokenRef = useRef<string | null>(null);
  const originRef = useRef<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setError(null);
    setStatus("Connecting…");
    const response = await fetch("/api/archwalk/creator-session", {
      method: "POST",
      cache: "no-store",
    });
    const body = (await response.json()) as SessionPayload & {
      error?: string;
    };
    if (!response.ok) {
      throw new Error(body.error ?? "Unable to start the 360 editor.");
    }
    if (tokenAppearsInUrl(body.creatorUrl, body.token)) {
      throw new Error("Creator session token must not appear in the iframe URL.");
    }
    tokenRef.current = body.token;
    originRef.current = body.creatorOrigin;
    setIframeSrc(body.creatorUrl);
    setStatus("Waiting for editor…");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSession().catch((reason: unknown) => {
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to start the 360 editor.",
        );
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSession]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const iframeWindow = iframeRef.current?.contentWindow ?? null;
      const expectedOrigin = originRef.current;
      if (!expectedOrigin) return;
      if (!isTrustedArchWalkMessage(event, expectedOrigin, iframeWindow)) {
        return;
      }

      if (event.data.type === "creator:ready-for-init") {
        const token = tokenRef.current;
        if (!token || !iframeWindow) return;
        iframeWindow.postMessage(creatorInitMessage(token), expectedOrigin);
        return;
      }

      if (event.data.type === "creator:ready") {
        setStatus("Ready");
        setError(null);
        return;
      }

      if (event.data.type === "creator:reauth-required") {
        setStatus("Reauthenticating…");
        loadSession().catch((reason: unknown) => {
          setError(
            reason instanceof Error
              ? reason.message
              : "The 360 editor session expired.",
          );
        });
        return;
      }

      if (event.data.type === "creator:error") {
        const record = event.data as { message?: unknown };
        setError(
          typeof record.message === "string"
            ? record.message
            : "The 360 editor reported an error.",
        );
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loadSession]);

  useEffect(() => {
    return () => {
      tokenRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center sm:min-h-80">
        <p className="text-base font-medium text-foreground">360 editor</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{error}</p>
      </div>
    );
  }

  if (!iframeSrc) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center sm:min-h-80">
        <p className="text-base font-medium text-foreground">360 editor</p>
        <p className="mt-2 text-sm text-muted">{status}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <iframe
        key={iframeSrc}
        ref={iframeRef}
        title="ArchWalk 360 Creator"
        src={iframeSrc}
        className="block h-[70vh] w-full border-0"
      />
      <p className="border-t border-border px-4 py-2 text-xs text-muted">
        {status}
      </p>
    </div>
  );
}

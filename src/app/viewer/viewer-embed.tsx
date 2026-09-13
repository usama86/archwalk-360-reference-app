"use client";

import { useEffect, useRef } from "react";
import { viewerInitMessage } from "@/lib/archwalk/protocol";

export function ViewerEmbed({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const origin = new URL(src).origin;

  useEffect(() => {
    function onLoad() {
      const frame = iframeRef.current?.contentWindow;
      if (!frame) return;
      frame.postMessage(viewerInitMessage(), origin);
    }

    const node = iframeRef.current;
    node?.addEventListener("load", onLoad);
    return () => node?.removeEventListener("load", onLoad);
  }, [origin]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <iframe
        ref={iframeRef}
        title="ArchWalk 360 Viewer"
        src={src}
        allow="fullscreen"
        allowFullScreen
        className="block h-[70vh] w-full border-0"
      />
    </div>
  );
}

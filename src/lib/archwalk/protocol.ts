export const ARCHWALK_MESSAGE_SOURCE = "archwalk360";
export const ARCHWALK_MESSAGE_VERSION = 1;

export type ArchWalkEnvelope = {
  source: typeof ARCHWALK_MESSAGE_SOURCE;
  version: typeof ARCHWALK_MESSAGE_VERSION;
  type: string;
};

export function isArchWalkEnvelope(data: unknown): data is ArchWalkEnvelope {
  if (typeof data !== "object" || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    record.source === ARCHWALK_MESSAGE_SOURCE &&
    record.version === ARCHWALK_MESSAGE_VERSION &&
    typeof record.type === "string"
  );
}

export function isTrustedArchWalkMessage(
  event: { origin: string; source: unknown; data: unknown },
  expectedOrigin: string,
  expectedSource: unknown,
): boolean {
  return (
    event.origin === expectedOrigin &&
    expectedSource !== null &&
    event.source === expectedSource &&
    isArchWalkEnvelope(event.data)
  );
}

export function creatorInitMessage(token: string): ArchWalkEnvelope & {
  token: string;
} {
  return {
    source: ARCHWALK_MESSAGE_SOURCE,
    version: ARCHWALK_MESSAGE_VERSION,
    type: "creator:init",
    token,
  };
}

export function viewerInitMessage(): ArchWalkEnvelope {
  return {
    source: ARCHWALK_MESSAGE_SOURCE,
    version: ARCHWALK_MESSAGE_VERSION,
    type: "init",
  };
}

export function creatorIframeSrc(
  appOrigin: string,
  sessionApiId: string,
): string {
  return `${appOrigin}/aw360/c/${sessionApiId}`;
}

export function viewerIframeSrc(appOrigin: string, publicId: string): string {
  return `${appOrigin}/aw360/v/${publicId}`;
}

export function tokenAppearsInUrl(url: string, token: string): boolean {
  return token.length > 0 && url.includes(token);
}

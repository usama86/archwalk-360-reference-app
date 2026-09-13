export type ArchWalkConfig =
  | { configured: false; missing: string[] }
  | {
      configured: true;
      apiBase: string;
      appOrigin: string;
      apiKey: string;
    };

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getArchWalkConfig(
  env: Record<string, string | undefined> = process.env,
): ArchWalkConfig {
  const missing: string[] = [];
  const apiBase = env.ARCHWALK_API_BASE?.trim();
  const appOrigin = env.ARCHWALK_APP_ORIGIN?.trim();
  const apiKey = env.AW360_API_KEY?.trim();

  if (!apiBase) missing.push("ARCHWALK_API_BASE");
  if (!appOrigin) missing.push("ARCHWALK_APP_ORIGIN");
  if (!apiKey) missing.push("AW360_API_KEY");

  if (missing.length > 0 || !apiBase || !appOrigin || !apiKey) {
    return { configured: false, missing };
  }

  return {
    configured: true,
    apiBase: trimTrailingSlash(apiBase),
    appOrigin: trimTrailingSlash(appOrigin),
    apiKey,
  };
}

export function parentOriginFromRequest(
  request: Request,
  env: Record<string, string | undefined> = process.env,
): string {
  const configured = env.APP_ORIGIN?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return trimTrailingSlash(origin);
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Unable to determine the parent page origin.");
  }
  return `${proto}://${host}`;
}

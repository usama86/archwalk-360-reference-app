export class PartnerApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly retryAfterSeconds: number | null;
  readonly currentDraftRevision: number | null;
  readonly requiredScope: string | null;

  constructor(options: {
    status: number;
    message: string;
    code?: string | null;
    retryAfterSeconds?: number | null;
    currentDraftRevision?: number | null;
    requiredScope?: string | null;
  }) {
    super(options.message);
    this.name = "PartnerApiError";
    this.status = options.status;
    this.code = options.code ?? null;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.currentDraftRevision = options.currentDraftRevision ?? null;
    this.requiredScope = options.requiredScope ?? null;
  }
}

export function publicErrorMessage(error: PartnerApiError): string {
  switch (error.status) {
    case 401:
    case 403:
      return "ArchWalk 360 is unavailable for this workspace.";
    case 404:
      return "No ArchWalk 360 experience was found for this listing.";
    case 409:
      if (error.code === "archwalk_360_rate_limited") {
        return "ArchWalk 360 is busy. Try again shortly.";
      }
      return "This listing cannot be updated right now. Refresh and try again.";
    case 422:
      return "ArchWalk 360 could not complete that request.";
    case 429:
      return "ArchWalk 360 rate limit reached. Wait and try again.";
    case 503:
      return "ArchWalk 360 is temporarily unavailable.";
    default:
      return "ArchWalk 360 could not be reached.";
  }
}

type PartnerDetail = {
  code?: unknown;
  message?: unknown;
  retry_after_seconds?: unknown;
  current_draft_revision?: unknown;
  required_scope?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function parseRetryAfterHeader(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }
  const date = Date.parse(value);
  if (Number.isNaN(date)) return null;
  return Math.max(0, (date - Date.now()) / 1000);
}

export function partnerErrorFromResponse(
  status: number,
  body: unknown,
  retryAfterHeader: string | null,
): PartnerApiError {
  const record = asRecord(body);
  const detailValue = record?.detail;
  const detail: PartnerDetail | null =
    typeof detailValue === "string"
      ? { message: detailValue }
      : (asRecord(detailValue) as PartnerDetail | null);

  const retryAfterFromBody =
    typeof detail?.retry_after_seconds === "number"
      ? detail.retry_after_seconds
      : null;

  return new PartnerApiError({
    status,
    code: typeof detail?.code === "string" ? detail.code : null,
    message:
      typeof detail?.message === "string"
        ? detail.message
        : `ArchWalk Partner API request failed (${status}).`,
    retryAfterSeconds:
      retryAfterFromBody ?? parseRetryAfterHeader(retryAfterHeader),
    currentDraftRevision:
      typeof detail?.current_draft_revision === "number"
        ? detail.current_draft_revision
        : null,
    requiredScope:
      typeof detail?.required_scope === "string" ? detail.required_scope : null,
  });
}

export function waitMsForRetry(error: PartnerApiError): number {
  const seconds = error.retryAfterSeconds ?? 1;
  return Math.min(Math.max(seconds, 0.25) * 1000, 10_000);
}

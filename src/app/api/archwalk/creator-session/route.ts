import { createPartnerClient } from "@/lib/archwalk/client";
import { parentOriginFromRequest } from "@/lib/archwalk/env";
import { PartnerApiError, publicErrorMessage } from "@/lib/archwalk/errors";
import { creatorIframeSrc } from "@/lib/archwalk/protocol";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const client = createPartnerClient();
  if (!client.config.configured) {
    return Response.json(
      {
        error: "ArchWalk 360 is not configured.",
        missing: client.config.missing,
      },
      { status: 503 },
    );
  }

  try {
    const origin = parentOriginFromRequest(request);
    const experience = await client.createOrResolveExperience();
    const session = await client.mintCreatorSession(
      origin,
      experience.experience_id,
    );

    return Response.json({
      sessionApiId: session.api_id,
      token: session.token,
      creatorOrigin: client.config.appOrigin,
      creatorUrl: creatorIframeSrc(client.config.appOrigin, session.api_id),
      publicationStatus: experience.publication_status,
      publicId: experience.public_id,
    });
  } catch (error) {
    if (error instanceof PartnerApiError) {
      const status =
        error.status === 401 || error.status === 403 ? 503 : error.status;
      return Response.json(
        {
          error: publicErrorMessage(error),
          code: error.code,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        {
          status,
          headers:
            error.retryAfterSeconds !== null
              ? { "Retry-After": String(Math.ceil(error.retryAfterSeconds)) }
              : undefined,
        },
      );
    }

    return Response.json(
      { error: "ArchWalk 360 could not be reached." },
      { status: 503 },
    );
  }
}

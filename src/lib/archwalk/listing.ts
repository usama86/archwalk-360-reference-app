import { createPartnerClient } from "./client";
import { getArchWalkConfig } from "./env";
import { PartnerApiError, publicErrorMessage } from "./errors";
import { viewerIframeSrc } from "./protocol";

export type ViewerListing =
  | { status: "unconfigured"; missing: string[] }
  | { status: "unavailable"; message: string }
  | { status: "unpublished" }
  | { status: "published"; publicId: string; embedUrl: string };

export async function getViewerListing(): Promise<ViewerListing> {
  const config = getArchWalkConfig();
  if (!config.configured) {
    return { status: "unconfigured", missing: config.missing };
  }

  try {
    const client = createPartnerClient();
    const experience = await client.getExperienceByExternalId();
    if (!experience || experience.publication_status !== "published") {
      return { status: "unpublished" };
    }
    return {
      status: "published",
      publicId: experience.public_id,
      embedUrl: viewerIframeSrc(config.appOrigin, experience.public_id),
    };
  } catch (error) {
    if (error instanceof PartnerApiError && error.status === 404) {
      return { status: "unpublished" };
    }
    const message =
      error instanceof PartnerApiError
        ? publicErrorMessage(error)
        : "ArchWalk 360 could not be reached.";
    return { status: "unavailable", message };
  }
}

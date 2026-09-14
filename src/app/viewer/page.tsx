import { ViewerListingPage } from "./listing-page";
import { getViewerListing } from "@/lib/archwalk/listing";

export const dynamic = "force-dynamic";

export default async function ViewerPage() {
  const listing = await getViewerListing();
  return <ViewerListingPage embedUrl={listing.status === "published" ? listing.embedUrl : undefined} />;
}

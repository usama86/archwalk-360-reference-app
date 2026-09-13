import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { property } from "../property";
import { getViewerListing } from "./listing";

describe("viewer listing", () => {
  it("builds the documented Viewer embed URL after publish", async () => {
    const originalFetch = globalThis.fetch;
    const originalEnv = { ...process.env };
    Object.assign(process.env, {
      ARCHWALK_API_BASE: "https://api.archwalk.example",
      ARCHWALK_APP_ORIGIN: "https://app.archwalk.example",
      AW360_API_KEY: "aw360_sk_cred.testsecret",
    });

    globalThis.fetch = (async (input) => {
      const url = String(input);
      assert.match(url, /external_resource_id=sunset-villa-001/);
      return Response.json({
        items: [
          {
            experience_id: "exp_1",
            public_id: "pub_live",
            name: property.name,
            external_resource_id: property.externalListingKey,
            lifecycle_status: "active",
            publication_status: "published",
            draft_revision: 8,
          },
        ],
        next_cursor: null,
      });
    }) as typeof fetch;

    try {
      const listing = await getViewerListing();
      assert.deepEqual(listing, {
        status: "published",
        publicId: "pub_live",
        embedUrl: "https://app.archwalk.example/aw360/v/pub_live",
      });
    } finally {
      globalThis.fetch = originalFetch;
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) {
          delete process.env[key];
        }
      }
      Object.assign(process.env, originalEnv);
    }
  });
});

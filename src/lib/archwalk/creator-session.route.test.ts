import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { POST } from "../../app/api/archwalk/creator-session/route";

const env = {
  ARCHWALK_API_BASE: "https://api.archwalk.example",
  ARCHWALK_APP_ORIGIN: "https://app.archwalk.example",
  AW360_API_KEY: "aw360_sk_cred.testsecret",
  APP_ORIGIN: "http://localhost:3000",
};

describe("creator session route", () => {
  it("returns session id and token without putting the token in the iframe URL", async () => {
    const originalFetch = globalThis.fetch;
    const originalEnv = { ...process.env };
    Object.assign(process.env, env);

    globalThis.fetch = (async (input) => {
      const url = String(input);
      if (url.endsWith("/api/v1/360/experiences")) {
        return Response.json({
          experience_id: "exp_1",
          public_id: "pub_1",
          name: "Sunset Villa",
          external_resource_id: "sunset-villa-001",
          lifecycle_status: "active",
          publication_status: "unpublished",
          draft_revision: 1,
        });
      }
      if (url.endsWith("/api/v1/360/creator-sessions")) {
        return Response.json(
          {
            api_id: "sess_1",
            token: "aw360_cs_sess_1.secret",
            origin: "http://localhost:3000",
            permitted_actions: [],
            status: "active",
          },
          { status: 201 },
        );
      }
      throw new Error(`unexpected ${url}`);
    }) as typeof fetch;

    try {
      const response = await POST(
        new Request("http://localhost:3000/api/archwalk/creator-session", {
          method: "POST",
          headers: { origin: "http://localhost:3000" },
        }),
      );
      const body = (await response.json()) as {
        sessionApiId: string;
        token: string;
        creatorUrl: string;
      };
      assert.equal(response.status, 200);
      assert.equal(body.sessionApiId, "sess_1");
      assert.equal(body.token, "aw360_cs_sess_1.secret");
      assert.equal(body.creatorUrl, "https://app.archwalk.example/aw360/c/sess_1");
      assert.equal(body.creatorUrl.includes(body.token), false);
      assert.equal(JSON.stringify(body).includes("aw360_sk_"), false);
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

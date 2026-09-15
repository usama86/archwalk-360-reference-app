import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";
import { property } from "../property";
import { POST } from "../../app/api/archwalk/creator-session/route";

const env = {
  ARCHWALK_API_BASE: "https://api.archwalk.example",
  ARCHWALK_APP_ORIGIN: "https://app.archwalk.example",
  AW360_API_KEY: "aw360_sk_cred.testsecret",
  APP_ORIGIN: "http://localhost:3000",
};

describe("creator session route", () => {
  it("mints Creator access for the resolved existing Experience without putting the token in the iframe URL", async () => {
    const originalFetch = globalThis.fetch;
    const originalEnv = { ...process.env };
    const experienceId = randomUUID();
    const publicId = randomUUID();
    const calls: Array<{ url: string; body: unknown }> = [];
    Object.assign(process.env, env);

    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null });
      if (url.endsWith("/api/v1/360/experiences")) {
        return Response.json({
          experience_id: experienceId,
          public_id: publicId,
          name: "Sunset Villa",
          external_resource_id: property.externalListingKey,
          lifecycle_status: "active",
          publication_status: "published",
          draft_revision: 8,
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
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      assert.equal(body.sessionApiId, "sess_1");
      assert.equal(body.token, "aw360_cs_sess_1.secret");
      assert.equal(body.creatorUrl, "https://app.archwalk.example/aw360/c/sess_1");
      assert.equal(body.creatorUrl.includes(body.token), false);
      assert.equal(JSON.stringify(body).includes("aw360_sk_"), false);
      assert.equal((body as typeof body & { publicId: string }).publicId, publicId);
      assert.deepEqual(calls[0].body, { name: property.name, external_resource_id: property.externalListingKey });
      assert.equal((calls[1].body as { experience_id: string }).experience_id, experienceId);
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

  it("sends Cache-Control: no-store on session mint errors", async () => {
    const originalEnv = { ...process.env };
    delete process.env.ARCHWALK_API_BASE;
    delete process.env.ARCHWALK_APP_ORIGIN;
    delete process.env.AW360_API_KEY;
    try {
      const response = await POST(
        new Request("http://localhost:3000/api/archwalk/creator-session", {
          method: "POST",
        }),
      );
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
    } finally {
      Object.assign(process.env, originalEnv);
    }
  });
});

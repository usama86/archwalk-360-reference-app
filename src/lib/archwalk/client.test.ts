import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { property } from "../property";
import { createPartnerClient } from "./client";
import { PartnerApiError } from "./errors";

const env = {
  ARCHWALK_API_BASE: "https://api.archwalk.example",
  ARCHWALK_APP_ORIGIN: "https://app.archwalk.example",
  AW360_API_KEY: "aw360_sk_cred.testsecret",
};

function jsonResponse(status: number, body: unknown, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("Partner API client", () => {
  it("create-or-resolve posts the stable external listing key", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    const client = createPartnerClient({
      env,
      fetch: async (input, init) => {
        const url = String(input);
        calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null });
        return jsonResponse(201, {
          experience_id: "exp_1",
          public_id: "pub_1",
          name: property.name,
          external_resource_id: property.externalListingKey,
          lifecycle_status: "active",
          publication_status: "unpublished",
          draft_revision: 1,
        });
      },
    });

    const experience = await client.createOrResolveExperience();
    assert.equal(experience.experience_id, "exp_1");
    assert.equal(calls[0]?.url, "https://api.archwalk.example/api/v1/360/experiences");
    assert.deepEqual(calls[0]?.body, {
      name: "Sunset Villa",
      external_resource_id: "sunset-villa-001",
    });
  });

  it("retries create-or-resolve on 429 using Retry-After", async () => {
    let attempts = 0;
    const sleeps: number[] = [];
    const client = createPartnerClient({
      env,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fetch: async () => {
        attempts += 1;
        if (attempts === 1) {
          return jsonResponse(
            429,
            {
              detail: {
                code: "archwalk_360_rate_limited",
                message: "Slow down",
                retry_after_seconds: 2,
              },
            },
            { "Retry-After": "2" },
          );
        }
        return jsonResponse(200, {
          experience_id: "exp_1",
          public_id: "pub_1",
          name: property.name,
          external_resource_id: property.externalListingKey,
          lifecycle_status: "active",
          publication_status: "published",
          draft_revision: 4,
        });
      },
    });

    const experience = await client.createOrResolveExperience();
    assert.equal(experience.publication_status, "published");
    assert.equal(attempts, 2);
    assert.deepEqual(sleeps, [2000]);
  });

  it("does not retry Creator session minting", async () => {
    let attempts = 0;
    const client = createPartnerClient({
      env,
      sleep: async () => {
        throw new Error("sleep should not run for non-idempotent writes");
      },
      fetch: async () => {
        attempts += 1;
        return jsonResponse(429, {
          detail: {
            code: "archwalk_360_rate_limited",
            message: "Slow down",
            retry_after_seconds: 1,
          },
        });
      },
    });

    await assert.rejects(
      () => client.mintCreatorSession("http://localhost:3000", "exp_1"),
      (error: unknown) => {
        assert.ok(error instanceof PartnerApiError);
        assert.equal(error.status, 429);
        assert.equal(error.code, "archwalk_360_rate_limited");
        return true;
      },
    );
    assert.equal(attempts, 1);
  });

  it("maps generic 401 credential failures", async () => {
    const client = createPartnerClient({
      env,
      fetch: async () =>
        jsonResponse(
          401,
          {
            detail: {
              code: "archwalk_360_invalid_credential",
              message: "Invalid or expired API credential.",
            },
          },
          { "WWW-Authenticate": 'Bearer realm="archwalk-360"' },
        ),
    });

    await assert.rejects(
      () => client.getExperienceByExternalId(),
      (error: unknown) => {
        assert.ok(error instanceof PartnerApiError);
        assert.equal(error.status, 401);
        assert.equal(error.code, "archwalk_360_invalid_credential");
        return true;
      },
    );
  });

  it("sends the API key only as a Bearer header", async () => {
    let authorization = "";
    const client = createPartnerClient({
      env,
      fetch: async (_input, init) => {
        const headers = new Headers(init?.headers);
        authorization = headers.get("Authorization") ?? "";
        return jsonResponse(200, { items: [] });
      },
    });

    await client.getExperienceByExternalId();
    assert.equal(authorization, "Bearer aw360_sk_cred.testsecret");
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  creatorIframeSrc,
  creatorInitMessage,
  isTrustedArchWalkMessage,
  tokenAppearsInUrl,
  viewerIframeSrc,
} from "./protocol";

describe("embed protocol", () => {
  it("builds Creator and Viewer URLs without the session token", () => {
    const token = "aw360_cs_sess123.secret";
    const creatorUrl = creatorIframeSrc("https://archwalk.example", "sess123");
    const viewerUrl = viewerIframeSrc("https://archwalk.example", "pub_abc");

    assert.equal(creatorUrl, "https://archwalk.example/aw360/c/sess123");
    assert.equal(viewerUrl, "https://archwalk.example/aw360/v/pub_abc");
    assert.equal(tokenAppearsInUrl(creatorUrl, token), false);
    assert.equal(tokenAppearsInUrl(viewerUrl, token), false);
  });

  it("creates the documented creator:init envelope", () => {
    assert.deepEqual(creatorInitMessage("aw360_cs_sess.secret"), {
      source: "archwalk360",
      version: 1,
      type: "creator:init",
      token: "aw360_cs_sess.secret",
    });
  });

  it("accepts only exact origin, iframe source, and envelope", () => {
    const iframe = { name: "iframe" };
    const trusted = {
      origin: "https://archwalk.example",
      source: iframe,
      data: {
        source: "archwalk360",
        version: 1,
        type: "creator:ready-for-init",
      },
    };

    assert.equal(
      isTrustedArchWalkMessage(trusted, "https://archwalk.example", iframe),
      true,
    );
    assert.equal(
      isTrustedArchWalkMessage(trusted, "https://evil.example", iframe),
      false,
    );
    assert.equal(
      isTrustedArchWalkMessage(trusted, "https://archwalk.example", { other: true }),
      false,
    );
    assert.equal(
      isTrustedArchWalkMessage(
        { ...trusted, data: { type: "creator:ready-for-init" } },
        "https://archwalk.example",
        iframe,
      ),
      false,
    );
  });
});

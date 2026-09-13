import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = join(import.meta.dirname, "../../..");

describe("editor host layout", () => {
  it("keeps normal document flow and an explicit Creator iframe height", () => {
    const page = readFileSync(join(ROOT, "src/app/editor/page.tsx"), "utf8");
    const embed = readFileSync(join(ROOT, "src/app/editor/creator-embed.tsx"), "utf8");

    assert.match(page, /flex min-h-full flex-col/);
    assert.doesNotMatch(page, /h-dvh|md:overflow-hidden|min-h-0 flex-1 flex-col/);
    assert.match(page, /data-editor-workspace/);
    assert.match(embed, /h-\[min\(64dvh,30rem\)\]/);
    assert.match(embed, /md:h-\[clamp\(44rem,82dvh,56rem\)\]/);
    assert.match(embed, /allow="fullscreen"/);
    assert.doesNotMatch(embed, /h-full min-h-\[28rem\] md:min-h-0/);
  });
});

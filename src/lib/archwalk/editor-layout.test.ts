import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EditorPage from "../../app/editor/page";

const ROOT = join(import.meta.dirname, "../../..");

describe("editor host layout", () => {
  it("renders exactly one listing action in the intro before the Creator workspace", () => {
    const html = renderToStaticMarkup(createElement(EditorPage));
    assert.equal((html.match(/href="\/viewer"/g) ?? []).length, 1);
    assert.equal((html.match(/View public listing/g) ?? []).length, 1);
    const action = html.indexOf('href="/viewer"');
    assert.ok(action > html.indexOf("data-editor-intro"));
    assert.ok(action < html.indexOf("data-editor-workspace"));
    assert.doesNotMatch(html.slice(html.indexOf("data-editor-workspace")), /View public listing/);
  });
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

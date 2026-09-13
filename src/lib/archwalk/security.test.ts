import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = join(import.meta.dirname, "../../..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === ".next") return [];
      return walk(full);
    }
    return [full];
  });
}

describe("credential isolation", () => {
  it("does not reference the Partner API key from client components", () => {
    const files = walk(join(ROOT, "src")).filter(
      (file) =>
        (file.endsWith(".tsx") || file.endsWith(".ts")) &&
        !file.endsWith(".test.ts"),
    );

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (!source.includes('"use client"')) continue;
      assert.equal(
        source.includes("AW360_API_KEY"),
        false,
        `${file} must not read AW360_API_KEY`,
      );
      assert.equal(
        source.includes("aw360_sk_"),
        false,
        `${file} must not contain a Partner API key prefix`,
      );
    }
  });

  it("does not expose the Partner API key as a NEXT_PUBLIC env var", () => {
    const envExample = readFileSync(join(ROOT, ".env.example"), "utf8");
    assert.equal(envExample.includes("NEXT_PUBLIC_AW360_API_KEY"), false);
    assert.match(envExample, /^AW360_API_KEY=/m);
  });
});

import Link from "next/link";
import { CreatorEmbed } from "@/app/editor/creator-embed";
import { getArchWalkConfig } from "@/lib/archwalk/env";
import { property } from "@/lib/property";

export const dynamic = "force-dynamic";

export default function EditorPage() {
  const config = getArchWalkConfig();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden max-md:h-auto max-md:min-h-full max-md:overflow-visible">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[1536px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="text-sm font-medium tracking-wide text-foreground">
            Reference Realty
          </p>
          <Link
            href="/viewer"
            className="text-sm text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            Public Listing
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full min-h-0 max-w-[1536px] flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8 md:overflow-hidden">
        <div data-editor-intro className="mx-auto w-full max-w-3xl shrink-0">
          <p className="text-sm text-muted">Seller workspace</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            {property.name}
          </h1>
          <p className="mt-3 text-base text-muted">{property.location}</p>
          <p className="mt-6 text-sm text-muted">
            Listing ID:{" "}
            <span className="font-mono text-foreground">
              {property.externalListingKey}
            </span>
          </p>

          <section className="mt-8">
            <h2 className="font-serif text-2xl tracking-tight">
              360 Experience
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Create and manage the immersive 360 experience shown on this
              property’s public listing.
            </p>
          </section>
        </div>

        <div data-editor-workspace className="mt-4 flex min-h-0 flex-1 flex-col max-md:min-h-[32rem]">
          {config.configured ? (
            <CreatorEmbed />
          ) : (
            <div className="min-h-72 rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center sm:min-h-80">
              <p className="text-base font-medium text-foreground">
                360 editor integration
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Set ARCHWALK_API_BASE, ARCHWALK_APP_ORIGIN, and AW360_API_KEY to
                enable the embedded experience editor.
              </p>
              <p className="mt-8 text-xs tracking-wide text-muted uppercase">
                Not configured
              </p>
            </div>
          )}
        </div>

        <p className="mx-auto mt-4 max-w-3xl shrink-0">
          <Link
            href="/viewer"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            View public listing
          </Link>
        </p>
      </main>
    </div>
  );
}

import Link from "next/link";
import { property } from "@/lib/property";

export default function EditorPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
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

        <section className="mt-12">
          <h2 className="font-serif text-2xl tracking-tight">360 Experience</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            Create and manage the immersive 360 experience shown on this
            property’s public listing.
          </p>

          <div className="mt-8 min-h-72 rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center sm:min-h-80">
            <p className="text-base font-medium text-foreground">
              360 editor integration
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              The embedded experience editor will appear here.
            </p>
            <p className="mt-8 text-xs tracking-wide text-muted uppercase">
              Not configured
            </p>
          </div>

          <p className="mt-8">
            <Link
              href="/viewer"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              View public listing
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

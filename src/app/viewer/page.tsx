import Link from "next/link";
import { property } from "@/lib/property";

export default function ViewerPage() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
        <p className="text-sm text-muted">{property.location}</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {property.name}
        </h1>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <div>
            <dt className="sr-only">Bedrooms</dt>
            <dd>{property.bedrooms} bedrooms</dd>
          </div>
          <div>
            <dt className="sr-only">Bathrooms</dt>
            <dd>{property.bathrooms} bathrooms</dd>
          </div>
          <div>
            <dt className="sr-only">Property type</dt>
            <dd>{property.typeLabel}</dd>
          </div>
        </dl>

        <p className="mt-8 max-w-xl text-base leading-7 text-muted">
          {property.description}
        </p>

        <section className="mt-12">
          <h2 className="font-serif text-2xl tracking-tight">360 Tour</h2>
          <div className="mt-6 min-h-72 rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center sm:min-h-80">
            <p className="text-base font-medium text-foreground">
              Published 360 experience
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              The customer-facing 360 tour will appear here once published.
            </p>
          </div>
        </section>

        <p className="mt-10">
          <Link
            href="/editor"
            className="text-sm text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            Manage listing
          </Link>
        </p>
      </main>
    </div>
  );
}

import Link from "next/link";
import { ListingMedia } from "./listing-media";
import { property } from "@/lib/property";

export function ViewerListingPage({ embedUrl }: { embedUrl?: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-surface/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/viewer" className="font-serif text-2xl tracking-tight">Reference Realty<span className="text-accent">.</span></Link>
          <span className="text-xs text-muted sm:text-sm">Spaces worth exploring</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-12 pt-7 sm:px-8 sm:pt-9">
        <p className="text-xs text-muted">Pakistan <span aria-hidden className="mx-2">/</span> Islamabad <span aria-hidden className="mx-2">/</span> Residential</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{property.name}</h1>
            <p className="mt-2 text-sm text-muted">{property.location}</p>
          </div>
          <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <div><dt className="sr-only">Bedrooms</dt><dd>{property.bedrooms} bedrooms</dd></div>
            <div><dt className="sr-only">Bathrooms</dt><dd>{property.bathrooms} bathrooms</dd></div>
            <div><dt className="sr-only">Property type</dt><dd>{property.typeLabel}</dd></div>
          </dl>
        </div>
        <ListingMedia embedUrl={embedUrl} />
        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-16">
          <section aria-labelledby="property-about">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Room to unwind</p>
            <h2 id="property-about" className="mt-2 font-serif text-3xl">About this property</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{property.description}</p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"><li>Generous living spaces</li><li>Sunlit courtyard</li><li>Margalla Hills setting</li></ul>
          </section>
          <aside className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h2 className="font-serif text-2xl">A feel for the space</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Take a look around before planning your visit. This is a demonstration listing; reservations are not available here.</p>
          </aside>
        </div>
      </main>
      <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-muted sm:px-8"><p>Reference Realty · Demonstration property</p><Link href="/editor" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent">Seller demo workspace</Link></div></footer>
    </div>
  );
}

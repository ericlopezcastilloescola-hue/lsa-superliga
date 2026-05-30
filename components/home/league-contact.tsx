import { LEAGUE_CONTACT_EMAIL, LEAGUE_OWNERS } from "@/lib/config/contact";

function InstagramIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function FounderBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className="h-px w-10 bg-gradient-to-r from-transparent via-violet-500/35 to-violet-400/20 sm:w-14"
        aria-hidden
      />
      <span className="relative px-1">
        <span
          className="pointer-events-none absolute -inset-x-3 -inset-y-1 rounded-full bg-violet-500/[0.07] blur-sm"
          aria-hidden
        />
        <span className="relative text-[10px] font-semibold uppercase tracking-[0.45em] text-violet-300/90 sm:text-[11px]">
          {label}
        </span>
      </span>
      <span
        className="h-px w-10 bg-gradient-to-l from-transparent via-violet-500/35 to-violet-400/20 sm:w-14"
        aria-hidden
      />
    </div>
  );
}

function FounderName({ name }: { name: string }) {
  return (
    <div className="relative mt-5 sm:mt-6">
      <p
        className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-3xl font-bold uppercase tracking-[0.18em] text-violet-500/20 blur-[2px] sm:text-4xl"
        aria-hidden
      >
        {name}
      </p>
      <p className="relative bg-gradient-to-b from-white via-zinc-100 to-violet-200/90 bg-clip-text text-3xl font-bold uppercase tracking-[0.16em] text-transparent drop-shadow-[0_0_24px_rgba(167,139,250,0.25)] sm:text-4xl sm:tracking-[0.18em]">
        {name}
      </p>
      <div className="mx-auto mt-5 flex items-center justify-center gap-2" aria-hidden>
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-violet-500/40" />
        <span className="text-[8px] text-violet-400/50">◆</span>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-violet-500/40" />
      </div>
    </div>
  );
}

function OwnerCard({
  name,
  role,
  instagram,
}: (typeof LEAGUE_OWNERS)[number]) {
  return (
    <div className="group relative flex flex-col items-center px-6 py-10 text-center sm:px-8 sm:py-14">
      <span
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-3 rounded-lg border border-white/[0.04] transition-colors group-hover:border-violet-500/15"
        aria-hidden
      />

      <FounderBadge label={role} />
      <FounderName name={name} />

      <a
        href={instagram.href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-200"
      >
        <InstagramIcon />
        {instagram.handle}
      </a>
    </div>
  );
}

export function LeagueContact({ embedded = false }: { embedded?: boolean }) {
  return (
    <section
      className={
        embedded
          ? "overflow-hidden bg-[#0c0e14]"
          : "overflow-hidden rounded-xl border border-white/10 bg-[#0c0e14]"
      }
    >
      <div className="border-b border-white/10 px-6 py-8 text-center sm:px-10 sm:py-10">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-zinc-500">
          Fundadores
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Dirección y gestión de la liga
        </p>
        <div
          className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
          aria-hidden
        />
      </div>

      <div className="grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {LEAGUE_OWNERS.map((owner) => (
          <OwnerCard key={owner.name} {...owner} />
        ))}
      </div>

      <div className="border-t border-white/10 bg-gradient-to-b from-[#0f1018] to-[#0c0e14] px-6 py-10 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-lg text-center">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.35em] text-zinc-500">
            Contacto
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            Consultas, patrocinios y colaboraciones
          </p>
          <a
            href={`mailto:${LEAGUE_CONTACT_EMAIL}`}
            className="group mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors hover:border-violet-500/30 hover:bg-white/[0.05]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0c0e14] text-zinc-400 transition-colors group-hover:border-violet-500/30 group-hover:text-violet-300">
              <MailIcon />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xs text-zinc-500">Correo oficial</span>
              <span className="block text-sm font-medium text-zinc-200 group-hover:text-violet-200">
                {LEAGUE_CONTACT_EMAIL}
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

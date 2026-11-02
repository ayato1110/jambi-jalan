import type { ReactNode } from "react";

export default function PramudiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pramudi-scope flex min-h-dvh flex-col bg-pramudi-bg text-pramudi-text">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:border focus:border-pramudi-live focus:bg-pramudi-panel focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-pramudi-text"
      >
        Lewati ke konten
      </a>

      <header className="border-b border-pramudi-line bg-pramudi-panel">
        <div className="mx-auto flex min-h-14 w-full max-w-[560px] items-center justify-between gap-3 px-4">
          <div className="flex min-h-11 items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-5" fill="none">
                <rect x="4" y="3" width="16" height="14" rx="2" fill="#FFFFFF" />
                <rect x="6.5" y="6" width="11" height="5" rx="1" fill="#0F766E" />
                <circle cx="8" cy="19" r="2" fill="#FFFFFF" />
                <circle cx="16" cy="19" r="2" fill="#FFFFFF" />
              </svg>
            </span>
            <span className="text-sm font-extrabold tracking-tight">JAMBI JALAN</span>
          </div>

          <span className="whitespace-nowrap rounded-md border border-pramudi-line bg-pramudi-bg px-2 py-1 text-xs font-semibold text-pramudi-live">
            PRAMUDI
          </span>
        </div>
      </header>

      <main id="konten" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-[560px] px-4 py-6 text-xs leading-relaxed text-pramudi-muted">
        <p>
          Panel pramudi hanya untuk petugas. Posisi dikirim setiap 10 detik saat trip berjalan.
        </p>
      </footer>
    </div>
  );
}

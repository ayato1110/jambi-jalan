import Link from "next/link";
import type { ReactNode } from "react";
import { DishubNav } from "@/components/dishub/DishubNav";

export default function DishubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:border focus:border-line-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Lewati ke konten
      </a>

      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex min-h-14 w-full items-center justify-between gap-3 px-4 lg:px-6">
          <Link
            href="/dishub"
            aria-label="Dashboard Dishub JAMBI JALAN"
            className="flex min-h-11 items-center gap-2 rounded-lg"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-brand" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-5" fill="none">
                <rect x="4" y="3" width="16" height="14" rx="2" fill="#FFFFFF" />
                <rect x="6.5" y="6" width="11" height="5" rx="1" fill="#0F766E" />
                <circle cx="8" cy="19" r="2" fill="#FFFFFF" />
                <circle cx="16" cy="19" r="2" fill="#FFFFFF" />
              </svg>
            </span>
            <span className="text-sm font-extrabold tracking-tight text-ink">JAMBI JALAN</span>
            <span className="hidden rounded bg-elevated px-2 py-0.5 text-[0.625rem] font-semibold text-ink-secondary min-[420px]:inline">
              DISHUB
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-ink-secondary underline decoration-line underline-offset-4 hover:bg-elevated hover:text-ink"
          >
            Aplikasi Penumpang
          </Link>
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside className="hidden w-[240px] shrink-0 border-r border-line bg-surface lg:block">
          <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <p className="px-4 pt-4 text-xs font-semibold text-ink-muted">Dashboard Dishub</p>
            <DishubNav varian="sidebar" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-14 z-20 border-b border-line bg-surface lg:hidden">
            <DishubNav varian="tabs" />
          </div>
          <main id="konten" tabIndex={-1} className="w-full flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      <footer className="border-t border-line bg-surface px-4 py-6 text-xs leading-relaxed text-ink-muted lg:px-6">
        <div className="flex w-full flex-col gap-3">
          <p>
            JAMBI JALAN · Sistem Informasi Penumpang &amp; Evaluasi Operasional Bus Listrik Trans
            Bahagia Kota Jambi.
          </p>
          <nav aria-label="Informasi tambahan" className="flex flex-wrap gap-x-4">
            <Link
              href="/panduan-tap"
              className="inline-flex min-h-11 min-w-11 items-center justify-center underline decoration-line underline-offset-4 hover:text-ink"
            >
              Panduan Tap
            </Link>
            <Link
              href="/aksesibel"
              className="inline-flex min-h-11 min-w-11 items-center justify-center underline decoration-line underline-offset-4 hover:text-ink"
            >
              Aksesibel
            </Link>
            <Link
              href="/tentang-data"
              className="inline-flex min-h-11 min-w-11 items-center justify-center underline decoration-line underline-offset-4 hover:text-ink"
            >
              Tentang Data
            </Link>
            <Link
              href="/pramudi"
              className="inline-flex min-h-11 min-w-11 items-center justify-center underline decoration-line underline-offset-4 hover:text-ink"
            >
              Pramudi
            </Link>
            <Link
              href="/dishub"
              className="inline-flex min-h-11 min-w-11 items-center justify-center underline decoration-line underline-offset-4 hover:text-ink"
            >
              Dishub
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

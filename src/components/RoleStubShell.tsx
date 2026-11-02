import Link from "next/link";
import type { ReactNode } from "react";

export function RoleStubShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:border focus:border-line-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Lewati ke konten
      </a>

      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex w-full max-w-[560px] items-center justify-between gap-3 px-4 py-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg text-sm font-extrabold tracking-tight text-ink"
          >
            JAMBI JALAN
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-ink-secondary underline decoration-line underline-offset-4 hover:bg-elevated hover:text-ink"
          >
            Aplikasi Penumpang
          </Link>
        </div>
      </header>

      <main id="konten" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-[560px] px-4 py-6 text-xs leading-relaxed text-ink-muted">
        <p>Prototipe JAMBI JALAN untuk Jambi Smart City Application Challenge 2026.</p>
      </footer>
    </div>
  );
}

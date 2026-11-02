import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/penumpang/BottomNav";
import { PassengerHeader } from "@/components/penumpang/PassengerHeader";

export default function PenumpangLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:border focus:border-line-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Lewati ke konten
      </a>
      <PassengerHeader />
      <main id="konten" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[560px] px-4 pb-bottom-nav pt-6 text-xs leading-relaxed text-ink-muted">
        <p>
          JAMBI JALAN · Sistem Informasi Penumpang &amp; Evaluasi Operasional Bus Listrik Trans
          Bahagia Kota Jambi.
        </p>
        <nav aria-label="Informasi tambahan" className="mt-2 flex flex-wrap gap-x-4">
          <Link
            href="/terdekat"
            className="inline-flex min-h-11 min-w-11 items-center justify-center underline decoration-line underline-offset-4 hover:text-ink"
          >
            Halte Terdekat
          </Link>
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
      </footer>
      <BottomNav />
    </div>
  );
}

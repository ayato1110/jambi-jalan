"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bacaTeks, dukunganSuara, hentikanSuara } from "@/lib/speechHelper";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

function IkonBus() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-brand" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <rect x="4" y="3" width="16" height="14" rx="2" fill="#FFFFFF" />
        <rect x="6.5" y="6" width="11" height="5" rx="1" fill="#0F766E" />
        <circle cx="8" cy="19" r="2" fill="#FFFFFF" />
        <circle cx="16" cy="19" r="2" fill="#FFFFFF" />
      </svg>
    </span>
  );
}

const tautanPeran =
  "inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-ink-secondary underline decoration-line underline-offset-4 hover:bg-elevated hover:text-ink active:translate-y-px";

export function PassengerHeader() {
  const pathname = usePathname();
  const modeAksesibel = useJambiJalanStore((state) => state.modeAksesibel);
  const setModeAksesibel = useJambiJalanStore((state) => state.setModeAksesibel);

  const aktifkanSuara = () => {
    const berikut = !modeAksesibel;
    setModeAksesibel(berikut);

    if (!berikut) {
      hentikanSuara();
      return;
    }

    if (!dukunganSuara()) return;

    if (pathname === "/") {
      window.dispatchEvent(new Event("jambi-jalan:bacakan-jadwal"));
      return;
    }

    bacaTeks("Mode teks besar aktif. Buka halaman Jadwal untuk mendengar informasi trip.");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex min-h-14 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/"
              aria-label="JAMBI JALAN, kembali ke Beranda Jadwal"
              className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg"
            >
              <IkonBus />
              <span className="whitespace-nowrap text-[0.9375rem] font-extrabold tracking-tight text-ink">
                JAMBI JALAN
              </span>
            </Link>
            <span className="hidden whitespace-nowrap rounded bg-brand-soft px-2 py-0.5 text-[0.625rem] font-semibold text-brand-deep sm:inline">
              TRANS BAHAGIA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <nav aria-label="Pindah peran" className="hidden items-center gap-1 sm:flex">
              <Link href="/pramudi" className={tautanPeran}>
                Pramudi
              </Link>
              <Link href="/dishub" className={tautanPeran}>
                Dishub
              </Link>
            </nav>

            <button
              type="button"
              onClick={aktifkanSuara}
              aria-pressed={modeAksesibel}
              aria-label={
                modeAksesibel
                  ? "Matikan teks besar dan suara"
                  : "Nyalakan teks besar dan bacakan jadwal"
              }
              className={`inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-3 text-sm font-semibold active:translate-y-px ${
                modeAksesibel
                  ? "border-brand bg-brand text-white"
                  : "border-line-strong bg-surface text-ink hover:bg-elevated"
              }`}
            >
              A+ Suara
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:hidden">
          <span className="whitespace-nowrap rounded bg-brand-soft px-2 py-0.5 text-[0.625rem] font-semibold text-brand-deep">
            TRANS BAHAGIA
          </span>
          <nav aria-label="Pindah peran" className="flex items-center gap-1">
            <Link href="/pramudi" className={tautanPeran}>
              Pramudi
            </Link>
            <Link href="/dishub" className={tautanPeran}>
              Dishub
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";

export function EmptyStateCard({
  judul,
  pesan,
  aksi,
  catatan,
  className = "",
}: {
  judul: string;
  pesan: string;
  aksi?: ReactNode;
  catatan?: string;
  className?: string;
}) {
  return (
    <section
      aria-label={judul}
      className={`rounded-xl border border-line bg-surface p-5 ${className}`}
    >
      <h2 className="text-lg font-semibold leading-snug text-ink">{judul}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{pesan}</p>
      {catatan ? <p className="mt-3 text-xs leading-relaxed text-ink-muted">{catatan}</p> : null}
      {aksi ? <div className="mt-5 flex flex-col gap-2 sm:flex-row">{aksi}</div> : null}
    </section>
  );
}

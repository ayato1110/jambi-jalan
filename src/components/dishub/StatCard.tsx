import type { ReactNode } from "react";

const GAYA_NILAI = {
  neutral: "text-ink",
  brand: "text-brand-deep",
  amber: "text-amber-deep",
  danger: "text-danger-deep",
} as const;

export function StatCard({
  label,
  value,
  note,
  tone = "neutral",
  aksi,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  tone?: keyof typeof GAYA_NILAI;
  aksi?: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold tabular ${GAYA_NILAI[tone]}`}>
        {value}
      </p>
      {note ? <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{note}</p> : null}
      {aksi ? <div className="mt-3">{aksi}</div> : null}
    </article>
  );
}

"use client";

export function ErrorFallbackCard({
  judul,
  pesan,
  labelAksi,
  onAksi,
  nada = "warning",
}: {
  judul: string;
  pesan: string;
  labelAksi?: string;
  onAksi?: () => void;
  nada?: "warning" | "danger";
}) {
  const gaya =
    nada === "danger"
      ? "border-danger bg-danger-soft text-danger-deep"
      : "border-amber bg-amber-soft text-amber-deep";

  return (
    <section role="status" className={`rounded-xl border p-4 ${gaya}`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-current text-sm font-bold"
        >
          !
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-snug">{judul}</h2>
          <p className="mt-1 text-sm leading-relaxed">{pesan}</p>
          {labelAksi && onAksi ? (
            <button
              type="button"
              onClick={onAksi}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-current bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px"
            >
              {labelAksi}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

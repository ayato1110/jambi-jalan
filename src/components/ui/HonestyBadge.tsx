export type JenisBadge =
  | "langsung"
  | "perkiraan"
  | "jadwal"
  | "data-contoh"
  | "asumsi"
  | "publik";

const GAYA: Record<JenisBadge, string> = {
  langsung: "border-brand bg-brand-soft text-brand-deep",
  perkiraan: "border-dashed border-amber bg-amber-soft text-amber-deep",
  jadwal: "border-line bg-elevated text-ink-secondary",
  "data-contoh": "border-line bg-elevated text-ink-secondary",
  asumsi: "border-amber bg-amber-soft text-amber-deep",
  publik: "border-brand bg-brand-soft text-brand-deep",
};

const LABEL: Record<JenisBadge, string> = {
  langsung: "Posisi Langsung",
  perkiraan: "Estimasi Jadwal",
  jadwal: "Jadwal Reguler",
  "data-contoh": "Estimasi Operasional",
  asumsi: "Proyeksi Simulasi",
  publik: "Data Operasional",
};

const SIMBOL: Partial<Record<JenisBadge, string>> = {
  langsung: "●",
  perkiraan: "◷",
  jadwal: "◷",
  publik: "●",
};

export function HonestyBadge({
  jenis,
  label,
  className = "",
}: {
  jenis: JenisBadge;
  label?: string;
  className?: string;
}) {
  const simbol = SIMBOL[jenis];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold ${GAYA[jenis]} ${className}`}
    >
      {simbol ? (
        <span aria-hidden="true" className="text-[0.7em] leading-none">
          {simbol}
        </span>
      ) : null}
      {label ?? LABEL[jenis]}
    </span>
  );
}

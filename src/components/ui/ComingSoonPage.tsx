import Link from "next/link";

export function ComingSoonPage({
  judul,
  deskripsi,
  hrefKembali = "/",
  labelKembali = "Kembali ke Jadwal",
}: {
  judul: string;
  deskripsi: string;
  hrefKembali?: string;
  labelKembali?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <p className="text-xs font-semibold text-brand-deep">Halaman lanjutan</p>
      <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">{judul}</h1>

      <section className="mt-4 rounded-xl border border-line bg-surface p-5">
        <span className="inline-flex rounded-md border border-line bg-elevated px-2 py-0.5 text-xs font-semibold text-ink-secondary">
          Segera hadir
        </span>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{deskripsi}</p>
        <Link
          href={hrefKembali}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
        >
          {labelKembali}
        </Link>
      </section>
    </div>
  );
}

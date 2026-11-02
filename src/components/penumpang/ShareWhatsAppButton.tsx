export function ShareWhatsAppButton({ teks }: { teks: string }) {
  const tautan = `https://wa.me/?text=${encodeURIComponent(teks)}`;

  return (
    <a
      href={tautan}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
    >
      Bagikan ke WhatsApp
    </a>
  );
}

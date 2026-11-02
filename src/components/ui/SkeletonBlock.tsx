export function SkeletonBlock({
  className = "",
  baris = 3,
  label = "Memuat data",
}: {
  className?: string;
  baris?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="animate-pulse space-y-3">
        {Array.from({ length: Math.max(1, baris) }, (_, i) => (
          <div
            key={i}
            className={`rounded-md bg-elevated ${i === 0 ? "h-9 w-3/5" : "h-4"} ${
              i > 0 ? (i % 2 === 0 ? "w-4/5" : "w-full") : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

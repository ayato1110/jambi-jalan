"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/dishub", label: "Monitoring Armada" },
  { href: "/dishub/simulator", label: "Simulator Tarif & Armada" },
  { href: "/dishub/kinerja", label: "Laporan Kinerja" },
  { href: "/dishub/permintaan", label: "Analisis Permintaan" },
  { href: "/dishub/rute", label: "Kelola Rute & Halte" },
];

export function DishubNav({ varian }: { varian: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  const dasar =
    "inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-semibold transition-colors";

  return (
    <nav
      aria-label="Navigasi Dishub"
      className={
        varian === "sidebar"
          ? "space-y-1 p-3"
          : "flex gap-1 overflow-x-auto px-3 py-2 scrollbar-sembunyi"
      }
    >
      {MENU.map((menu) => {
        const aktif = pathname === menu.href;

        return (
          <Link
            key={menu.href}
            href={menu.href}
            aria-current={aktif ? "page" : undefined}
            className={`${dasar} ${
              varian === "tabs" ? "shrink-0 whitespace-nowrap" : "w-full"
            } ${
              aktif
                ? "border-brand bg-brand-soft text-brand-deep"
                : "border-transparent text-ink-secondary hover:bg-elevated hover:text-ink"
            }`}
          >
            {menu.label}
          </Link>
        );
      })}
    </nav>
  );
}

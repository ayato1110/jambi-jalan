"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/", label: "Jadwal" },
  { href: "/peta", label: "Peta & Halte" },
  { href: "/rencana", label: "Rencana" },
  { href: "/panduan-tap", label: "Panduan Tap" },
  { href: "/aksesibel", label: "Aksesibel" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama penumpang"
      className="bottom-nav-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-[0_4px_12px_rgba(17,28,24,0.08)]"
    >
      <div className="mx-auto flex w-full max-w-[560px] items-stretch">
        {MENU.map((menu) => {
          const aktif = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              aria-current={aktif ? "page" : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 border-t-4 px-1 py-1 text-center text-[0.6875rem] font-semibold leading-tight ${
                aktif
                  ? "border-brand bg-brand-soft text-brand-deep"
                  : "border-transparent text-ink-secondary hover:bg-elevated"
              }`}
            >
              {menu.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

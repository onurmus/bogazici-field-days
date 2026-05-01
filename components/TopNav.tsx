"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Canlı" },
//   { href: "/program", label: "Program" },
//   { href: "/sonuclar", label: "Sonuçlar" },
//   { href: "/sporcular", label: "Sporcular" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full flex justify-between items-center px-4 md:px-12 py-4 bg-stone-50 border-b-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-8">
        <span className="text-xl md:text-2xl font-black text-zinc-900 tracking-tighter uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Boğaziçi Üniversitesi FIELD Days - 2026
        </span>
        <nav className="hidden md:flex gap-6 font-bold uppercase tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-blue-600 border-b-4 border-blue-600 pb-1"
                    : "text-zinc-900 font-bold hover:text-blue-600 transition-colors duration-100"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-yellow-400 transition-colors duration-100 active:translate-x-0.5 active:translate-y-0.5">
          <span className="material-symbols-outlined">language</span>
        </button>
      </div>
    </header>
  );
}

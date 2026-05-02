"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDE_LINKS = [
  { href: "/gun/1", icon: "calendar_today", label: "1. GÜN" },
  { href: "/gun/2", icon: "event_repeat", label: "2. GÜN" },
  { href: "/program", icon: "calendar_month", label: "PROGRAM" },
//   { href: "/rekorlar", icon: "emoji_events", label: "REKORLAR" },
  { href: "/hakkinda", icon: "info", label: "HAKKINDA" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-full fixed left-0 top-[76px] bottom-0 bg-stone-50 border-r-4 border-zinc-900 overflow-y-auto z-40"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      {/* <div className="p-6 border-b-4 border-zinc-900">
        <h2 className="text-2xl font-black italic uppercase">FIELD DAYS 2026</h2>
        <p className="text-[10px] tracking-widest text-zinc-600 mt-1 uppercase">Atletizm Sonuç Sistemi</p>
      </div> */}
      <nav className="py-4">
        {SIDE_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "bg-yellow-400 text-zinc-900 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] m-2 flex items-center gap-3 p-4 hover:skew-x-1 active:scale-95 transition-transform font-black uppercase"
                  : "text-zinc-600 flex items-center gap-3 p-4 m-2 hover:bg-stone-200 hover:skew-x-1 active:scale-95 transition-transform font-black uppercase"
              }
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", icon: "calendar_today", label: "1. Gün" },
  { href: "/gun/2", icon: "event_repeat", label: "2. Gün" },
  { href: "/program", icon: "calendar_month", label: "Program" },
//   { href: "/sonuclar", icon: "emoji_events", label: "Sonuçlar" },
//   { href: "/sporcular", icon: "person", label: "Sporcular" },
//   { href: "/hakkinda", icon: "info", label: "Hakkında" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full flex justify-between items-center px-4 md:px-12 py-4 bg-stone-50 border-b-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-8">
          <span
            className="text-xl md:text-2xl font-black text-zinc-900 tracking-tighter uppercase"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Boğaziçi Ünivesitesi FIELD Days - 2026
          </span>
          {/* Desktop nav */}
          <nav
            className="hidden md:flex gap-6 font-bold uppercase tracking-tighter"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
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

        <div className="flex items-center gap-2">
          <button className="hidden md:block p-2 hover:bg-yellow-400 transition-colors duration-100 active:translate-x-0.5 active:translate-y-0.5">
            <span className="material-symbols-outlined">language</span>
          </button>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 border-2 border-zinc-900 hover:bg-yellow-400 transition-colors active:scale-95"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            <span className="material-symbols-outlined">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <nav
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-stone-50 border-l-4 border-zinc-900 shadow-[-6px_0_0_0_rgba(0,0,0,1)] flex flex-col transition-transform duration-200 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b-4 border-zinc-900">
          <span className="font-black uppercase tracking-tighter text-lg">FIELD Days 2026</span>
          <button
            className="p-1 hover:bg-yellow-400 transition-colors active:scale-95"
            onClick={() => setMenuOpen(false)}
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col py-3 flex-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "bg-yellow-400 text-zinc-900 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-3 my-1 flex items-center gap-3 px-4 py-4 font-black uppercase"
                    : "text-zinc-600 flex items-center gap-3 px-4 py-4 mx-3 my-1 hover:bg-stone-200 font-black uppercase"
                }
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

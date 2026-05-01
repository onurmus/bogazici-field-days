export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 md:px-12 mt-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-900 border-t-4 border-zinc-900 text-xs font-bold uppercase tracking-widest text-zinc-50" style={{ fontFamily: "var(--font-inter)" }}>
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="text-lg font-black text-yellow-400">BÜ FIELD DAYS</span>
        <p>© 2026 Boğaziçi Üniversitesi Atletizm. Tüm hakları saklıdır.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        <a href="#" className="text-zinc-400 hover:text-zinc-50 transition-all hover:underline decoration-2 underline-offset-4">İletişim</a>
        <a href="#" className="text-zinc-400 hover:text-zinc-50 transition-all hover:underline decoration-2 underline-offset-4">Teknik Kurallar</a>
        <a href="#" className="text-zinc-400 hover:text-zinc-50 transition-all hover:underline decoration-2 underline-offset-4">KVKK Aydınlatma Metni</a>
      </div>
    </footer>
  );
}

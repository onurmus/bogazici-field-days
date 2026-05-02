import TopNav from "@/components/TopNav";

export default function RootLoadingPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-10 w-56 bg-zinc-200 rounded animate-pulse mb-8" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-4 border-zinc-200 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-5 mb-4"
          >
            <div className="h-5 w-48 bg-zinc-200 rounded animate-pulse mb-3" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" style={{ animationDelay: `${i * 60 + 20}ms` }} />
          </div>
        ))}
        <div className="flex items-center gap-3 mt-8 justify-center text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">Yükleniyor…</span>
        </div>
      </main>
    </div>
  );
}

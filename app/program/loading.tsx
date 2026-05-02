import TopNav from "@/components/TopNav";

export default function ProgramLoadingPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
      <TopNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title skeleton */}
        <div className="h-10 w-48 bg-zinc-200 rounded animate-pulse mb-8" />

        {/* Day tabs skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="h-11 w-28 bg-yellow-400 border-4 border-zinc-900 rounded-none animate-pulse" />
          <div className="h-11 w-28 bg-zinc-200 border-4 border-zinc-300 rounded-none animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Header row */}
          <div className="flex gap-4 bg-zinc-900 px-4 py-3">
            {["w-24", "w-24", "w-48", "w-16", "w-20"].map((w, i) => (
              <div key={i} className={`h-4 ${w} bg-zinc-600 rounded animate-pulse`} />
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className={`flex gap-4 px-4 py-3 border-b-2 border-zinc-200 ${i % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
            >
              <div className={`h-4 w-20 bg-zinc-200 rounded animate-pulse`} style={{ animationDelay: `${i * 40}ms` }} />
              <div className={`h-4 w-20 bg-zinc-200 rounded animate-pulse`} style={{ animationDelay: `${i * 40 + 10}ms` }} />
              <div className={`h-4 ${i % 3 === 0 ? "w-52" : i % 3 === 1 ? "w-44" : "w-48"} bg-zinc-300 rounded animate-pulse`} style={{ animationDelay: `${i * 40 + 20}ms` }} />
              <div className={`h-4 w-12 bg-zinc-200 rounded animate-pulse`} style={{ animationDelay: `${i * 40 + 30}ms` }} />
              <div className={`h-4 w-16 bg-zinc-200 rounded animate-pulse`} style={{ animationDelay: `${i * 40 + 35}ms` }} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-8 justify-center text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">Yükleniyor…</span>
        </div>
      </main>
    </div>
  );
}

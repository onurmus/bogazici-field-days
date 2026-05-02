import TopNav from "@/components/TopNav";

function SkeletonRow({ widths }: { widths: string[] }) {
  return (
    <tr className="border-b-2 border-zinc-300">
      {widths.map((w, i) => (
        <td key={i} className="px-3 py-3">
          <div className={`h-4 bg-zinc-200 rounded animate-pulse ${w}`} />
        </td>
      ))}
    </tr>
  );
}

export default function EventLoadingPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
      <TopNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link skeleton */}
        <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse mb-6" />

        {/* Event title card skeleton */}
        <div className="border-4 border-zinc-900 bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
          <div className="h-8 w-56 bg-yellow-600/30 rounded animate-pulse mb-3" />
          <div className="h-4 w-32 bg-yellow-600/20 rounded animate-pulse" />
        </div>

        {/* Heat/section heading skeleton */}
        <div className="h-6 w-40 bg-zinc-200 rounded animate-pulse mb-4" />

        {/* Results table skeleton */}
        <div className="border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Table header */}
          <div className="flex bg-zinc-900 px-3 py-3 gap-4">
            <div className="h-4 w-6 bg-zinc-600 rounded animate-pulse" />
            <div className="h-4 w-40 bg-zinc-600 rounded animate-pulse" />
            <div className="h-4 w-20 bg-zinc-600 rounded animate-pulse ml-auto" />
            <div className="h-4 w-20 bg-zinc-600 rounded animate-pulse" />
          </div>

          {/* Table rows */}
          <table className="w-full border-collapse">
            <tbody>
              {[
                ["w-5", "w-48", "w-24", "w-20", "w-16"],
                ["w-5", "w-40", "w-28", "w-20", "w-16"],
                ["w-5", "w-52", "w-20", "w-20", "w-16"],
                ["w-5", "w-44", "w-32", "w-20", "w-16"],
                ["w-5", "w-36", "w-24", "w-20", "w-16"],
                ["w-5", "w-48", "w-28", "w-20", "w-16"],
                ["w-5", "w-42", "w-20", "w-20", "w-16"],
                ["w-5", "w-50", "w-24", "w-20", "w-16"],
              ].map((widths, i) => (
                <SkeletonRow key={i} widths={widths} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-3 mt-8 justify-center text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">Yükleniyor…</span>
        </div>
      </main>
    </div>
  );
}

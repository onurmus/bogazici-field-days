import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import Footer from "@/components/Footer";

export const metadata = { title: "2. Gün – BÜ  2026" };

export default function Gun2Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e8]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
      <TopNav />
      <div className="flex flex-1">
        <SideNav />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <div className="border-4 border-zinc-900 bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 max-w-md w-full text-center">
            <span className="material-symbols-outlined text-5xl mb-4 block">event_repeat</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">2. Gün</h1>
            <p className="text-lg font-bold uppercase tracking-widest text-zinc-700">
              Program Hazırlanmakta
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

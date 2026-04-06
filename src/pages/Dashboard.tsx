// src/pages/Dashboard.tsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#140406] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-3xl rounded-2xl border border-red-900/40 bg-[#221013]/90 p-8 shadow-[0_0_35px_rgba(255,45,85,0.08)]">
        <div className="mb-4 inline-block rounded-md border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-pink-400">
          Temporary Page
        </div>

        <h1 className="font-mono text-4xl font-bold">
          Dashboard <span className="text-pink-500">Coming Soon</span>
        </h1>

        <p className="mt-4 text-gray-400">
          This is a temporary dashboard so your routes work while we build the real one.
        </p>

        <div className="mt-8 rounded-xl border border-red-900/30 bg-[#16090b] p-4 font-mono text-sm text-gray-300">
          <p>
            <span className="text-orange-400">const</span>{" "}
            <span className="text-pink-400">status</span> ={" "}
            <span className="text-white">"temporary_dashboard"</span>;
          </p>
          <p>
            <span className="text-orange-400">const</span>{" "}
            <span className="text-pink-400">nextStep</span> ={" "}
            <span className="text-white">"build real dashboard UI"</span>;
          </p>
        </div>
      </div>
    </div>
  );
}
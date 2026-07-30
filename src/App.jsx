import TestWordTable from "./Components/TestWordTable";
import { useState, useEffect } from "react";
import { BarChart3, Shield, Zap } from "lucide-react";

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    {
      label: "Processing Speed",
      value: "Instant",
      icon: Zap,
      accent: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Accuracy Rate",
      value: "99.9%",
      icon: BarChart3,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Data Privacy",
      value: "Secure",
      icon: Shield,
      accent: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white">
                  Nexa
                </span>
                <span className="text-lg font-bold tracking-tight text-emerald-400">
                  {" "}M-PESA
                </span>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5 hidden sm:block">
                  Statement Analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Instant analysis, no uploads to server
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
            Turn your M-PESA{" "}
            <span className="text-emerald-400">statements</span>
            <br className="hidden sm:block" /> into clear insights
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Upload your statement, get monthly breakdowns, totals, and a full
            transaction view — all processed locally in your browser.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-14">
          {stats.map(({ label, value, icon: Icon, accent, bg }) => (
            <div
              key={label}
              className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl border ${bg} backdrop-blur-sm`}
            >
              <div className={`${accent} flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Component */}
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 rounded-2xl" />
          <div className="relative bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
            <TestWordTable />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Nexa M-PESA Analyzer. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

import TestWordTable from "./Components/TestWordTable";
import { useState, useEffect } from "react";

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/80 shadow-2xl shadow-emerald-500/10"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-white to-emerald-400 bg-clip-text text-transparent">
                  Nexa M-PESA Analyzer
                </h1>
                <p className="text-xs text-emerald-400/60 hidden sm:block">
                  Statement Analysis Made Simple
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
    

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Transform Your{" "}
            <span className="bg-linear-to-r from-emerald-400 via-emerald-300 to-green-400 bg-clip-text text-transparent">
              M-PESA Statements
            </span>
            <br />
            Into Actionable Insights
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload, analyze, and visualize your M-PESA transaction history with
            powerful analytics and beautiful data visualization.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {[
            {
              label: "Processing Speed",
              value: "Instant",
              icon: "⚡",
              gradient: "from-amber-500/20 to-amber-600/20",
            },
            {
              label: "Accuracy Rate",
              value: "99.9%",
              icon: "🎯",
              gradient: "from-emerald-500/20 to-emerald-600/20",
            },
            {
              label: "Data Privacy",
              value: "Secure",
              icon: "🔒",
              gradient: "from-blue-500/20 to-blue-600/20",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`relative group p-4 sm:p-6 rounded-2xl bg-linear-to-br ${stat.gradient} border border-slate-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/5 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Main Table Component */}
        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-emerald-500/50 via-emerald-400/25 to-emerald-600/50 rounded-2xl blur-lg opacity-50"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <TestWordTable />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center">
        
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Nexa M-PESA Analyzer. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

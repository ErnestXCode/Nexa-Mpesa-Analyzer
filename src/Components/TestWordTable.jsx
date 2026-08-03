import { useState, useMemo } from "react";
import { getTables } from "../lib/readWordTable";
import * as XLSX from "xlsx";
import { normalizeMpesaTable } from "../lib/normalizeMpesaTable";
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Download
} from "lucide-react";

export default function TestWordTable() {
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(0);
  const [fileName, setFileName] = useState("");

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const rawTables = await getTables(file);
    const cleanedTables = rawTables.map((table) => {
      if (!table.length) return table;
      const header = table[0].join(" ");
      if (
        header.includes("Receipt No") &&
        header.includes("Completion Time") &&
        header.includes("Balance")
      ) {
        return normalizeMpesaTable(table);
      }
      return table;
    });

    console.log("Raw Tables");
    console.log(rawTables);
    console.log("Normalized Tables");
    console.log(cleanedTables);
    setTables(cleanedTables);
    setCurrentTable(0);
  }

  function parseAmount(value) {
    return (
      Number(
        String(value)
          .replace(/,/g, "")
          .replace(/[^\d.-]/g, ""),
      ) || 0
    );
  }

  const table = tables[currentTable] || [];

  const monthlySummaries = useMemo(() => {
    const summaries = {};
    const ungroupedRows = [];

    tables.forEach((table, tableIndex) => {
      if (!table.length || table[0].length !== 7) return;

      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        if (row.length !== 7) continue;

        const hasContent = row.some((cell) => cell && cell.trim() !== "");
        if (!hasContent) continue;

        const dateStr = row[1];

        if (dateStr && dateStr.length >= 7) {
          const yearMonth = dateStr.substring(0, 7);

          if (/^\d{4}-\d{2}$/.test(yearMonth)) {
            if (!summaries[yearMonth]) {
              summaries[yearMonth] = { paidIn: 0, withdrawn: 0, count: 0 };
            }
            summaries[yearMonth].paidIn += parseAmount(row[4]);
            summaries[yearMonth].withdrawn += Math.abs(parseAmount(row[5]));
            summaries[yearMonth].count++;
          } else {
            ungroupedRows.push({ row, tableIndex: tableIndex + 1, rowIndex: i });
          }
        } else {
          ungroupedRows.push({ row, tableIndex: tableIndex + 1, rowIndex: i });
        }
      }
    });

    const sortedSummaries = Object.entries(summaries)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, ...value }));

    return { summaries: sortedSummaries, ungroupedRows };
  }, [tables]);

  const grandTotals = tables.reduce(
    (totals, table) => {
      if (!table.length) return totals;
      if (table[0].length !== 7) return totals;
      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        if (row.length !== 7) continue;
        totals.paidIn += parseAmount(row[4]);
        totals.withdrawn += Math.abs(parseAmount(row[5]));
      }
      return totals;
    },
    { paidIn: 0, withdrawn: 0 },
  );

  function getTableTotals(table) {
    return table.slice(1).reduce(
      (totals, row) => {
        if (row.length === 7) {
          totals.paidIn += parseAmount(row[4]);
          totals.withdrawn += Math.abs(parseAmount(row[5]));
        }
        return totals;
      },
      { paidIn: 0, withdrawn: 0 },
    );
  }
  function handleExport() {
  const wb = XLSX.utils.book_new();

  // Monthly summary sheet
  const summaryRows = [
    ["Month", "Transactions", "Paid In", "Withdrawn", "Net"],
    ...monthlySummaries.summaries.map((s) => [
      `${getMonthName(s.key.substring(5, 7))} ${s.key.substring(0, 4)}`,
      s.count,
      s.paidIn,
      s.withdrawn,
      s.paidIn - s.withdrawn,
    ]),
    [
      "Total",
      monthlySummaries.summaries.reduce((sum, x) => sum + x.count, 0),
      monthlySummaries.summaries.reduce((sum, x) => sum + x.paidIn, 0),
      monthlySummaries.summaries.reduce((sum, x) => sum + x.withdrawn, 0),
      monthlySummaries.summaries.reduce((sum, x) => sum + x.paidIn - x.withdrawn, 0),
    ],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Monthly Summary");

  // One sheet per uploaded table
  tables.forEach((t, i) => {
    const sheet = XLSX.utils.aoa_to_sheet(t);
    XLSX.utils.book_append_sheet(wb, sheet, `Table ${i + 1}`);
  });

  // Ungrouped/unmatched rows, if any
  if (monthlySummaries.ungroupedRows.length > 0) {
    const ungroupedRows = [
      ["Table", "Receipt No.", "Completion Time", "Details", "Status", "Paid In", "Withdrawn", "Balance"],
      ...monthlySummaries.ungroupedRows.map(({ row, tableIndex }) => [tableIndex, ...row]),
    ];
    const ungroupedSheet = XLSX.utils.aoa_to_sheet(ungroupedRows);
    XLSX.utils.book_append_sheet(wb, ungroupedSheet, "Unmatched Rows");
  }

  const outName = fileName ? fileName.replace(/\.docx$/i, "") : "mpesa-analysis";
  XLSX.writeFile(wb, `${outName}.xlsx`);
}

  const tableTotals = getTableTotals(table);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function getMonthName(monthNum) {
    return monthNames[parseInt(monthNum) - 1] || monthNum;
  }

  const hasData = tables.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Upload Statement
        </label>
        <label className="flex flex-col items-center justify-center gap-3 w-full border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 cursor-pointer transition-colors group">
          <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </div>
          {fileName ? (
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-400">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1">Click to replace</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">
                Drop your .docx file here
              </p>
              <p className="text-xs text-slate-500 mt-1">or click to browse</p>
            </div>
          )}
          <input
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {hasData && (
        <>
        <div className="flex justify-end">
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Export to Excel
    </button>
  </div>
          {/* Grand Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Total Paid In
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                KES {grandTotals.paidIn.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Total Withdrawn
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-red-400">
                KES {grandTotals.withdrawn.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Monthly Summaries */}
          {monthlySummaries.summaries.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-white mb-4">
                Monthly Breakdown
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Month</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Transactions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Paid In</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Withdrawn</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {monthlySummaries.summaries.map((summary) => {
                      const net = summary.paidIn - summary.withdrawn;
                      return (
                        <tr key={summary.key} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-200">
                            {getMonthName(summary.key.substring(5, 7))} {summary.key.substring(0, 4)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400">{summary.count}</td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-medium">{summary.paidIn.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-red-400 font-medium">{summary.withdrawn.toLocaleString()}</td>
                          <td className={`px-4 py-3 text-right font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {net >= 0 ? "+" : ""}{net.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr className="bg-slate-800/60 font-bold border-t-2 border-slate-600">
                      <td className="px-4 py-3 text-slate-200">Total</td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {monthlySummaries.summaries.reduce((s, x) => s + x.count, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400">
                        {monthlySummaries.summaries.reduce((s, x) => s + x.paidIn, 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-red-400">
                        {monthlySummaries.summaries.reduce((s, x) => s + x.withdrawn, 0).toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right ${monthlySummaries.summaries.reduce((s, x) => s + x.paidIn - x.withdrawn, 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {monthlySummaries.summaries.reduce((s, x) => s + x.paidIn - x.withdrawn, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ungrouped rows */}
              {monthlySummaries.ungroupedRows.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-amber-400">
                      {monthlySummaries.ungroupedRows.length} transaction{monthlySummaries.ungroupedRows.length !== 1 ? "s" : ""} could not be grouped
                    </h4>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-amber-700/40">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-amber-900/20">
                          {["Table", "Receipt No.", "Completion Time", "Details", "Status", "Paid In", "Withdrawn", "Balance"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {monthlySummaries.ungroupedRows.map(({ row, tableIndex }, index) => (
                          <tr key={index} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 text-center font-bold text-slate-300">{tableIndex}</td>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-slate-300 whitespace-pre-wrap max-w-xs">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table navigator */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-semibold text-white">
                  Transaction Detail
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTable(Math.max(0, currentTable - 1))}
                  disabled={currentTable === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-400 px-1">
                  {currentTable + 1} / {tables.length}
                </span>
                <button
                  onClick={() => setCurrentTable(Math.min(tables.length - 1, currentTable + 1))}
                  disabled={currentTable === tables.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table totals */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">Page Paid In</span>
                <span className="text-sm font-bold text-emerald-400">{tableTotals.paidIn.toLocaleString()}</span>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">Page Withdrawn</span>
                <span className="text-sm font-bold text-red-400">{tableTotals.withdrawn.toLocaleString()}</span>
              </div>
            </div>

            {/* Raw table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700/60">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-slate-800">
                  {table.map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-slate-800/80" : "hover:bg-slate-800/30 transition-colors"}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`px-3 py-2.5 align-top whitespace-pre-wrap ${
                            i === 0
                              ? "text-xs font-semibold text-slate-300 uppercase tracking-wide"
                              : "text-slate-300"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.length > 1 && (
                    <tr className="bg-slate-800/60 font-bold">
                      <td colSpan="4" className="px-3 py-2.5 text-slate-300 text-xs uppercase tracking-wide">Total</td>
                      <td className="px-3 py-2.5 text-emerald-400">{tableTotals.paidIn.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-red-400">{tableTotals.withdrawn.toLocaleString()}</td>
                      <td className="px-3 py-2.5"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="text-center py-16 text-slate-600">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Upload a statement to see your analysis</p>
        </div>
      )}
    </div>
  );
}

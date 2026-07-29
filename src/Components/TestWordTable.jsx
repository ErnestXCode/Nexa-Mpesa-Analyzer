import { useState, useMemo } from "react";
import { getTables } from "../lib/readWordTable";
import { normalizeMpesaTable } from "../lib/normalizeMpesaTable";

export default function TestWordTable() {
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(0);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

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

  // Monthly summaries
  const monthlySummaries = useMemo(() => {
    const summaries = {};
    const ungroupedRows = [];

    tables.forEach((table, tableIndex) => {
      if (!table.length || table[0].length !== 7) return;

      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        if (row.length !== 7) continue;

        // Skip completely empty rows
        const hasContent = row.some((cell) => cell && cell.trim() !== "");
        if (!hasContent) continue;

        const dateStr = row[1]; // Completion Time

        // Just grab first 7 chars - that's our YYYY-MM
        if (dateStr && dateStr.length >= 7) {
          const yearMonth = dateStr.substring(0, 7); // "2026-04"

          if (/^\d{4}-\d{2}$/.test(yearMonth)) {
            if (!summaries[yearMonth]) {
              summaries[yearMonth] = {
                paidIn: 0,
                withdrawn: 0,
                count: 0,
              };
            }

            summaries[yearMonth].paidIn += parseAmount(row[4]);
            summaries[yearMonth].withdrawn += Math.abs(parseAmount(row[5]));
            summaries[yearMonth].count++;
          } else {
            ungroupedRows.push({
              row,
              tableIndex: tableIndex + 1,
              rowIndex: i,
            });
          }
        } else {
          ungroupedRows.push({ row, tableIndex: tableIndex + 1, rowIndex: i });
        }
      }
    });

    // Sort by year-month
    const sortedSummaries = Object.entries(summaries)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        key,
        ...value,
      }));

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

  const tableTotals = getTableTotals(table);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function getMonthName(monthNum) {
    return monthNames[parseInt(monthNum) - 1] || monthNum;
  }

  return (
    <div className="mt-16 rounded-xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-6 text-2xl font-bold">Word Table Viewer</h2>

      <input
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleUpload}
        className="mb-6 border border-gray-400 p-2 rounded-xl w-full"
      />

      {/* Monthly Summaries Section */}
      {monthlySummaries.summaries.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 text-xl font-bold">Monthly Summaries</h3>

          <div className="overflow-auto rounded-lg border border-slate-700">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-800">
                  <th className="border border-slate-600 p-2 text-left">
                    Month
                  </th>
                  <th className="border border-slate-600 p-2 text-right">
                    Transactions
                  </th>
                  <th className="border border-slate-600 p-2 text-right">
                    Paid In
                  </th>
                  <th className="border border-slate-600 p-2 text-right">
                    Withdrawn
                  </th>
                  <th className="border border-slate-600 p-2 text-right">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlySummaries.summaries.map((summary) => (
                  <tr key={summary.key} className="hover:bg-slate-800/50">
                    <td className="border border-slate-600 p-2">
                      {getMonthName(summary.key.substring(5, 7))}{" "}
                      {summary.key.substring(0, 4)}
                    </td>
                    <td className="border border-slate-600 p-2 text-right">
                      {summary.count}
                    </td>
                    <td className="border border-slate-600 p-2 text-right text-green-400">
                      {summary.paidIn.toLocaleString()}
                    </td>
                    <td className="border border-slate-600 p-2 text-right text-red-400">
                      {summary.withdrawn.toLocaleString()}
                    </td>
                    <td
                      className={`border border-slate-600 p-2 text-right font-bold ${
                        summary.paidIn - summary.withdrawn >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {(summary.paidIn - summary.withdrawn).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="bg-slate-800 font-bold">
                  <td className="border border-slate-600 p-2">TOTAL</td>
                  <td className="border border-slate-600 p-2 text-right">
                    {monthlySummaries.summaries.reduce(
                      (sum, s) => sum + s.count,
                      0,
                    )}
                  </td>
                  <td className="border border-slate-600 p-2 text-right text-green-400">
                    {monthlySummaries.summaries
                      .reduce((sum, s) => sum + s.paidIn, 0)
                      .toLocaleString()}
                  </td>
                  <td className="border border-slate-600 p-2 text-right text-red-400">
                    {monthlySummaries.summaries
                      .reduce((sum, s) => sum + s.withdrawn, 0)
                      .toLocaleString()}
                  </td>
                  <td
                    className={`border border-slate-600 p-2 text-right ${
                      monthlySummaries.summaries.reduce(
                        (sum, s) => sum + s.paidIn - s.withdrawn,
                        0,
                      ) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {monthlySummaries.summaries
                      .reduce((sum, s) => sum + s.paidIn - s.withdrawn, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ungrouped Transactions Table */}
          {monthlySummaries.ungroupedRows.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-lg font-bold text-yellow-400">
                ⚠ {monthlySummaries.ungroupedRows.length} Transaction
                {monthlySummaries.ungroupedRows.length !== 1 ? "s" : ""} Could
                Not Be Grouped
              </h4>

              <div className="overflow-auto rounded-lg border border-yellow-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-yellow-900/50">
                      <th className="border border-slate-600 p-2 text-left">
                        Table
                      </th>
                      <th className="border border-slate-600 p-2 text-left">
                        Receipt No.
                      </th>
                      <th className="border border-slate-600 p-2 text-left">
                        Completion Time
                      </th>
                      <th className="border border-slate-600 p-2 text-left">
                        Details
                      </th>
                      <th className="border border-slate-600 p-2 text-left">
                        Status
                      </th>
                      <th className="border border-slate-600 p-2 text-right">
                        Paid In
                      </th>
                      <th className="border border-slate-600 p-2 text-right">
                        Withdrawn
                      </th>
                      <th className="border border-slate-600 p-2 text-right">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummaries.ungroupedRows.map(
                      ({ row, tableIndex }, index) => (
                        <tr key={index} className="hover:bg-slate-800/50">
                          <td className="border border-slate-600 p-2 text-center font-bold">
                            {tableIndex}
                          </td>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className="border border-slate-600 p-2 whitespace-pre-wrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-green-900 p-4">
          <div className="text-sm text-slate-300">
            Total Paid In (All Tables)
          </div>
          <div className="mt-2 text-3xl font-bold">
            {grandTotals.paidIn.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-red-900 p-4">
          <div className="text-sm text-slate-300">
            Total Withdrawn (All Tables)
          </div>
          <div className="mt-2 text-3xl font-bold">
            {grandTotals.withdrawn.toLocaleString()}
          </div>
        </div>
      </div>

      {tables.length > 0 && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentTable(Math.max(0, currentTable - 1))}
              disabled={currentTable === 0}
              className="rounded bg-slate-700 px-4 py-2 disabled:opacity-40"
            >
              ◀ Previous
            </button>
            <div className="font-semibold">
              Table {currentTable + 1} / {tables.length}
            </div>
            <button
              onClick={() =>
                setCurrentTable(Math.min(tables.length - 1, currentTable + 1))
              }
              disabled={currentTable === tables.length - 1}
              className="rounded bg-slate-700 px-4 py-2 disabled:opacity-40"
            >
              Next ▶
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded bg-green-900 p-3">
              Table Paid In Total:
              <strong className="ml-2">
                {tableTotals.paidIn.toLocaleString()}
              </strong>
            </div>
            <div className="rounded bg-red-900 p-3">
              Table Withdrawn Total:
              <strong className="ml-2">
                {tableTotals.withdrawn.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full border-collapse">
              <tbody>
                {table.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`border border-slate-600 p-2 align-top whitespace-pre-wrap ${
                          i === 0 ? "bg-slate-800 font-bold" : ""
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.length > 1 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="border border-slate-600 p-2 font-bold"
                    >
                      TOTAL
                    </td>
                    <td className="border border-slate-600 p-2 font-bold">
                      {tableTotals.paidIn.toLocaleString()}
                    </td>
                    <td className="border border-slate-600 p-2 font-bold">
                      {tableTotals.withdrawn.toLocaleString()}
                    </td>
                    <td className="border border-slate-600 p-2"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

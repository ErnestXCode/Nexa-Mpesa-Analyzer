export function normalizeMpesaTable(table) {
  if (!table.length) return [];

  const normalized = [];
  const headers = [
    "Receipt No.",
    "Completion Time",
    "Details",
    "Transaction Status",
    "Paid In",
    "Withdrawn",
    "Balance"
  ];
  normalized.push(headers);

  let startRow = 1;

  // Handle merged first row
  if (
    table[0].length === 7 &&
    table[0][0].startsWith("Receipt No.")
  ) {
    const merged = table[0];
    const firstTransaction = [];
    merged.forEach((cell, i) => {
      const header = headers[i];
      let value = cell.startsWith(header)
        ? cell.substring(header.length).trim()
        : cell;
      if (
        i === 1 &&
        /^\d{4}-\d{2}-\d{2}/.test(value)
      ) {
        value = value.substring(0, 10);
      }
      firstTransaction.push(value);
    });
    normalized.push(firstTransaction);
  }

  for (let i = startRow; i < table.length; i++) {
    let row = [...table[i]];

    // If the row has 8 columns, remove the extra 3rd column
    if (row.length === 8) {
      console.log("8-column row before:", row);
      row.splice(2, 1);
      console.log("After shift:", row);
    }

    // Ignore rows that still aren't valid
    if (row.length !== 7) {
      console.warn("Skipping unexpected row:", row);
      continue;
    }

    // Check if Paid In (index 4) or Withdrawn (index 5) have stacked values
    const paidInParts = row[4].trim().split(/\s+/);
    const withdrawnParts = row[5].trim().split(/\s+/);
    
    const isMerged = (paidInParts.length === 2 && paidInParts[0] && paidInParts[1]) ||
                     (withdrawnParts.length === 2 && withdrawnParts[0] && withdrawnParts[1]);

    if (isMerged) {
      // Split into two rows
      const row1 = [...row];
      const row2 = [...row];

      // Split the money columns
      if (paidInParts.length === 2) {
        row1[4] = paidInParts[0];
        row2[4] = paidInParts[1];
      }
      if (withdrawnParts.length === 2) {
        row1[5] = withdrawnParts[0];
        row2[5] = withdrawnParts[1];
      }

      // Split other columns if they have two values, otherwise copy same value
      row.forEach((cell, index) => {
        if (index !== 4 && index !== 5) {
          const parts = cell.trim().split(/\s{2,}|\n/);
          if (parts.length === 2) {
            row1[index] = parts[0].trim();
            row2[index] = parts[1].trim();
          }
        }
      });

      // Process both rows
      [row1, row2].forEach(splitRow => {
        splitRow[0] = splitRow[0]
          .replace(/^Receipt No\./, "")
          .trim();
        splitRow[1] = splitRow[1]
          .replace(/^Completion Time/, "")
          .trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(splitRow[1])) {
          splitRow[1] = splitRow[1].substring(0, 10);
        }
        splitRow[2] = splitRow[2]
          .replace(/^Details/, "")
          .trim();
        splitRow[3] = splitRow[3]
          .replace(/^Transaction Status/, "")
          .trim();
        splitRow[4] = splitRow[4]
          .replace(/^Paid In/, "")
          .trim();
        splitRow[5] = splitRow[5]
          .replace(/^Withdrawn/, "")
          .trim();
        splitRow[6] = splitRow[6]
          .replace(/^Balance/, "")
          .trim();

        normalized.push(splitRow);
      });
    } else {
      // Normal single row processing (your original code untouched)
      row[0] = row[0]
        .replace(/^Receipt No\./, "")
        .trim();
      row[1] = row[1]
        .replace(/^Completion Time/, "")
        .trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(row[1])) {
        row[1] = row[1].substring(0, 10);
      }
      row[2] = row[2]
        .replace(/^Details/, "")
        .trim();
      row[3] = row[3]
        .replace(/^Transaction Status/, "")
        .trim();
      row[4] = row[4]
        .replace(/^Paid In/, "")
        .trim();
      row[5] = row[5]
        .replace(/^Withdrawn/, "")
        .trim();
      row[6] = row[6]
        .replace(/^Balance/, "")
        .trim();

      normalized.push(row);
    }
  }

  return normalized;
}
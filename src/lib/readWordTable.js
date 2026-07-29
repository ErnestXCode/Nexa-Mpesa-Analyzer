import JSZip from "jszip";

const TRANSACTION_HEADERS = [
    "Receipt No.",
    "Completion Time",
    "Details",
    "Transaction Status",
    "Paid In",
    "Withdrawn",
    "Balance"
];

export async function getTables(file) {

    const zip = await JSZip.loadAsync(file);

    const xml = await zip.file("word/document.xml").async("text");

    const doc = new DOMParser().parseFromString(
        xml,
        "application/xml"
    );

    const xmlTables = [...doc.getElementsByTagName("w:tbl")];

    const tables = [];

    for (const xmlTable of xmlTables) {

        let rows = [];

        const xmlRows = [...xmlTable.getElementsByTagName("w:tr")];

        for (const xmlRow of xmlRows) {

            const xmlCells = [...xmlRow.getElementsByTagName("w:tc")];

            const row = xmlCells.map((cell, index) => {

                let text = [...cell.getElementsByTagName("w:t")]
                    .map(t => t.textContent)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

                // Keep only date for Completion Time column
                if (
                    index === 1 &&
                    text.match(/^\d{4}-\d{2}-\d{2}/)
                ) {
                    text = text.substring(0, 10);
                }

                return text;

            });

            rows.push(row);

        }

        if (rows.length > 0) {

            const firstRow = rows[0];

            const looksLikeMergedHeader =
                firstRow.length === TRANSACTION_HEADERS.length &&
                firstRow.every((cell, i) =>
                    cell.startsWith(TRANSACTION_HEADERS[i])
                );

            if (looksLikeMergedHeader) {

                const headerRow = [];
                const firstTransaction = [];

                firstRow.forEach((cell, i) => {

                    const header = TRANSACTION_HEADERS[i];

                    headerRow.push(header);

                    let value = cell.replace(header, "").trim();

                    // Apply date cleaning to merged header transaction date
                    if (
                        i === 1 &&
                        value.match(/^\d{4}-\d{2}-\d{2}/)
                    ) {
                        value = value.substring(0, 10);
                    }

                    firstTransaction.push(value);

                });

                rows = [
                    headerRow,
                    firstTransaction,
                    ...rows.slice(1)
                ];

            }

        }

        tables.push(rows);

    }

    console.log(tables);

    return tables;

}
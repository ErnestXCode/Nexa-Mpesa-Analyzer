export function parseTables(html) {

    const parser = new DOMParser();

    const doc = parser.parseFromString(
        html,
        "text/html"
    );


    const tables = [
        ...doc.querySelectorAll("table")
    ];


    const transactions = [];


    function toNumber(value) {

        return Number(
            String(value)
                .replace(/KES/gi, "")
                .replace(/,/g, "")
                .replace(/[^\d.-]/g, "")
                .trim()
        ) || 0;

    }


    for (const table of tables) {

        const rows = [
            ...table.querySelectorAll("tr")
        ];


        for (const row of rows) {

            const cells = [
                ...row.querySelectorAll("td, th")
            ];


            if (cells.length !== 7) continue;


            const values = cells.map(cell =>
                cell.textContent
                    .replace(/\s+/g, " ")
                    .trim()
            );


            const joined = values
                .join(" ")
                .toLowerCase();


            if (
                joined.includes("receipt") ||
                joined.includes("completion") ||
                joined.includes("paid in") ||
                joined.includes("withdrawn") ||
                joined.includes("balance")
            ) {
                continue;
            }


            if (!values[0]) continue;


            transactions.push({

                receiptNo: values[0],

                completionTime: values[1],

                details: values[2],

                status: values[3],

                paidIn: toNumber(values[4]),

                withdrawn: Math.abs(
                    toNumber(values[5])
                ),

                balance: toNumber(values[6])

            });

        }

    }


    console.log("Tables found:", tables.length);
console.log("Transactions extracted:", transactions.length);

console.log("FULL EXTRACTED DATA:");
transactions.forEach((t, index) => {

    console.log(
        index + 1,
        {
            receiptNo: t.receiptNo,
            completionTime: t.completionTime,
            details: t.details,
            status: t.status,
            paidIn: t.paidIn,
            withdrawn: t.withdrawn,
            balance: t.balance
        }
    );

});


console.table(transactions);


return transactions;
}
import mammoth from "mammoth";


export async function extractWordTables(file) {

    const arrayBuffer = await file.arrayBuffer();


    const result = await mammoth.convertToHtml({
        arrayBuffer
    });


    return result.value;

}
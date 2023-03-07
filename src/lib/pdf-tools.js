import PdfPrinter from "pdfmake";
import imageToBase64 from 'image-to-base64';

export const getPDFReadableStream = async (post) => {
    const fonts = {
        Helvetica: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique",
        },
    }

    const printer = new PdfPrinter(fonts)

    const coverBase64 = await imageToBase64(post.cover);

    const docDefinition = {
        content: [
            {
                image: `data:image/jpeg;base64,${coverBase64}`,
                width: 500,
                margin: [0, 20]
            },
            {
                text: post.title,
                style: 'header'
            },
            {
                text: post.content,
                margin: [0, 20]
            }
        ],
        defaultStyle: {
            font: "Helvetica"
        },
        styles: {
            header: {
                fontSize: 18,
                bold: true
            }
        }
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
    pdfReadableStream.end()
    return pdfReadableStream
}

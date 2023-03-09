import sgMail from "@sendgrid/mail"
import { readPDFFile } from "./fs-tools.js"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmailToAuthor = async recipientAddress => {
    const msg = {
        to: recipientAddress,
        from: process.env.SENDER_EMAIL_ADDRESS,
        subject: "Yey!",
        text: "You made it!",
        html: "<strong>Your blog was posted!</strong>",
    }
    await sgMail.send(msg)
}

export const sendPDFToAuthor = async (recipientAddress) => {
    const pdfBuffer = await readPDFFile()
    const pdfBase64 = pdfBuffer.toString("base64")
    const msg = {
        to: recipientAddress,
        from: process.env.SENDER_EMAIL_ADDRESS,
        subject: "Yey!",
        text: "You made it!",
        html: "<strong>Your blog was posted! Here is a PDF of the Blog you just posted!</strong>",
        attachments: [
            {
                content: pdfBase64,
                filename: 'blogPost.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
            },
        ],
    }
    await sgMail.send(msg)
}
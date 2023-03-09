import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmailToAuthor = async recipientAdress => {
    const msg = {
        to: recipientAdress,
        from: process.env.SENDER_EMAIL_ADDRESS,
        subject: "Yey!",
        text: "You made it!",
        html: "<strong>Purrfect!</strong>",
    }
    await sgMail.send(msg)
}
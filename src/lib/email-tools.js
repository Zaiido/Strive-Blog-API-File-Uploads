import sgMail from "@sendgrid/mail"

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
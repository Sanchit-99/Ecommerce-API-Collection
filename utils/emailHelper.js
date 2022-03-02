const nodemailer = require("nodemailer")

const mailHelper = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  })

  const message = {
    from: 'rm234800@gmail.com', // sender address
    to: option.toEmail, // list of receivers
    subject: option.subject, // Subject line
    text: option.message, // plain text body
  }

  // send mail with defined transport object
  await transporter.sendMail(message)
}

module.exports = mailHelper

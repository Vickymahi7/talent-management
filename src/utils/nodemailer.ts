import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { HttpInternalServerError } from "../types/errors";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: true,
  auth: {
    user: process.env.NODE_MAIL_EMAIL_ID,
    pass: process.env.NODE_MAIL_PASSWORD,
  },
});

// transporter.verify(function (error, success) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Server is ready to take our messages");
//   }
// });

export const sendMail = async (mailOptions: MailOptions) => {
  try {
    return transporter.sendMail(mailOptions);
  } catch (error) {
    throw new HttpInternalServerError("Error sending email");
  }
};

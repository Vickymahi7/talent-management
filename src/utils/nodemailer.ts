import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { HttpInternalServerError } from "../types/errors";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAIL_EMAIL_ID,
    pass: process.env.NODE_MAIL_PASSWORD,
  },
});

export const sendMail = async (mailOptions: MailOptions) => {
  try {
    return transporter.sendMail(mailOptions);
  } catch (error) {
    throw new HttpInternalServerError("Error sending email");
  }
};

import { sendMail } from "../utils/nodemailer";
import {
  encodeInviteUserData,
  generateInviteRegistrationUrl,
} from "./userFunctions";

export async function sendUserInvitationMail(
  users: any,
  tenantId: string,
  createdById: string
) {
  const emailPromises = users.map((user) => {
    // Encode the values like TenantId-InvitedUserId-UserName-UserEamil
    const userData = {
      tenantId: tenantId,
      createdById: createdById,
      displayName: user.displayName,
      mail: user.mail,
    };

    const encodedString = encodeInviteUserData(userData);

    const generatedUrl = generateInviteRegistrationUrl(encodedString);

    const mailOptions = {
      from: process.env.NODE_MAIL_EMAIL_ID,
      to: user.mail,
      subject: "User Invitation Mail",
      html: `<p>Hi ${user.displayName},</p><p>Welcome to Talent Management.<br>Please click on <a href="${generatedUrl}">this link</a> to register your account</p><p>Regards,<br>Talent Management Team</p>`,
    };

    // Return a promise for sending the email
    return new Promise((resolve, reject) => {
      sendMail(mailOptions)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });

  // Send all emails concurrently
  Promise.all(emailPromises)
    .then((responses) => {
      console.log("All emails sent successfully:", responses);
      return responses;
    })
    .catch((error) => {
      console.error("Error sending emails:", error);
    });
}

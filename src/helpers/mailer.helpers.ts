import { userLogger } from "./../logger";
import nodemailer from "nodemailer";
import { IOptions } from "./dto";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST as string,
  port: process.env.MAIL_PORT as unknown as number,
  requireTLS: false,
  secure: true,
  auth: {
    user: process.env.MAIL_USER as string,
    pass: process.env.MAIL_PASS as string,
  },
  logger: false,
});

transporter.verify(function (error: unknown) {
  if (error) {
    console.log(error);
  } else {
    userLogger.info("Server is ready to take our messages");
  }
});

export const sendMail = async (options: IOptions) => {
  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: `<a href=${options.message}>Click here to log in to your account <br /> or copy and paste in your browser <br />
    ${options.message}
    </a>`,
    text: options.message,
  };

  try {
    const mailInfo = await transporter.sendMail(mailOptions);
    return Promise.resolve(mailInfo);
  } catch (error) {
    userLogger.error(error);
    return Promise.reject(error);
  }
};

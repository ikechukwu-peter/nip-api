import { userLogger } from "./../logger";
import { Request, Response } from "express";
import { sendMail } from "./../helpers";
import { IUser, UserModel } from "../models";
import { signToken, verifyToken } from "../utils";

export const login = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user: IUser | null = await UserModel.findOne({ email });
  if (user) {
    // Generate token
    const token = signToken(
      user?.email,
      process.env.JWT_SECRET as string,
      process.env.JWT_EXPIRESIN as string
    );
    try {
      sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Nip | Login Token",
        message: `${req.protocol}://${req.headers.host}/auth/authenticated/${token}`,
      });
      return res
        .status(200)
        .json({ message: "Please check your email to complete your sign in" });
    } catch (error) {
      userLogger.error(error);
      userLogger.error("An error occured while sending mail..");
      return res
        .status(500)
        .json({ error: "An error occured while sending mail.." });
    }
  }

  const newUser = await UserModel.create({ email });

  await newUser.save();

  // Generate token
  const token = signToken(
    newUser?.email,
    process.env.JWT_SECRET as string,
    process.env.JWT_EXPIRESIN as string
  );

  try {
    sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Nip | Login Token",
      message: `${req.protocol}://${req.headers.host}/auth/authenticated/${token}`,
    });

    return res
      .status(201)
      .json({ message: "Please check your email to complete your sign in" });
  } catch (error) {
    userLogger.error(error);
    return res
      .status(500)
      .json({ error: "An error occured while sending mail.." });
  }
};

export const authenticate = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    // Verify token
    const decodedToken = verifyToken(
      token,
      process.env.JWT_SECRET as string
    ) as { exp: number; email: string };

    // Get the expiration time from the decoded token
    const expTime = decodedToken.exp;

    // Check if the token has expired
    if (expTime < Date.now() / 1000) {
      userLogger.error("Invalid token or token has expired");

      return res
        .status(401)
        .json({ message: "Invalid token or token has expired" });
    }
    const user: IUser | null = await UserModel.findOne({
      email: decodedToken?.email,
    });

    if (user) {
      const url = `${process.env.CLIENT_URL}/dashboard/?authKey=${signToken(
        user?.email as string,
        process.env.JWT_AUTH_SECRET as string,
        process.env.JWT_AUTH_EXPIRESIN as string
      )}`;

      return res.redirect(200, url);
    }
    userLogger.error("Invalid token or token has expired");
    res.status(401).json({ message: "Invalid token or token has expired" });
  } catch (err) {
    res.status(401).json({ message: "Invalid token or token has expired" });
  }
};

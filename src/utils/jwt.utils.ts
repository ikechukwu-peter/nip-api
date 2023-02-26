import jwt from "jsonwebtoken";

export const signToken = (email: string, secret: string, expiresIn: string) => {
  return jwt.sign({ email }, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

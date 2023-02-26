import { NextFunction, Request, Response } from "express";
import {
  authSchema,
  getUrlSchema,
  getUrlWithPasswordSchema,
  loginSchema,
  urlSchema,
} from "../schema-validations";

//middleware to validate req data
export const validate =
  (
    schema:
      | typeof loginSchema
      | typeof authSchema
      | typeof urlSchema
      | typeof getUrlSchema
      | typeof getUrlWithPasswordSchema
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        ...(req?.body && { body: req.body }),
        ...(req?.query && { query: req.query }),
        ...(req?.params && { params: req.params }),
      });
      return next();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

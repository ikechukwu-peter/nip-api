import express from "express";
import passport from "passport";
import { validate } from "../middlewares";
import {
  getAUrlSchema,
  getUrlSchema,
  getUrlWithPasswordSchema,
  urlSchema,
} from "../schema-validations";
import {
  createUrl,
  createUrlUnsign,
  getUrl,
  getUrlWithPassword,
  getAUrl,
  getUrls,
  stats,
} from "./../controllers";

const urlRouter = express.Router();

urlRouter.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  validate(urlSchema),
  createUrl
);
urlRouter.post("/create/unsign", validate(urlSchema), createUrlUnsign);

urlRouter.get(
  "/get/:url/:password",
  validate(getUrlWithPasswordSchema),
  getUrlWithPassword
);

urlRouter.get(
  "/find/:id",
  passport.authenticate("jwt", { session: false }),
  validate(getAUrlSchema),
  getAUrl
);

urlRouter.get(
  "/get/all",
  passport.authenticate("jwt", { session: false }),
  getUrls
);

urlRouter.get(
  "/stats",
  passport.authenticate("jwt", { session: false }),
  stats
);

urlRouter.get("/:url", validate(getUrlSchema), getUrl);

export { urlRouter };

import express from "express";
import { validate } from "../middlewares";
import { login, authenticate } from "./../controllers";
import { authSchema, loginSchema } from "../schema-validations";

const authRouter = express.Router();

authRouter.post("/login", validate(loginSchema), login);
authRouter.get("/authenticated/:token", validate(authSchema), authenticate);

export { authRouter };

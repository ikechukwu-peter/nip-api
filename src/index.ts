import { mainLogger } from "./logger/index";
import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
//@ts-ignore
import xssClean from "xss-clean";
import { startMongoDB } from "./db/mongodb";
import passport from "passport";
import { passportAuthenticate } from "./config";
import { authRouter } from "./routes";
import { urlRouter } from "./routes/url.routes";

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many  requests. Please try again in about 10 minutes.",
});

const app: Application = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

//set http headers
app.use(helmet());
//compress the node application
app.use(compression());
//serve as a limiter for accessing our api
app.use(apiLimiter);
//clean againt injections
app.use(xssClean());

app.use(passport.initialize());

// Passport Config
passportAuthenticate(passport);

//initialize DB call
startMongoDB();

app.use("/", urlRouter);
app.use("/auth", authRouter);

//OPTIONAL (THIS IS JUST FOR HEALTH CHECK MAJORLY)
app.get("/get/ping", (req: Request, res: Response) => {
  res.send("pong");
});
app.all("*", async (req: Request, res: Response) => {
  res.status(404).json({
    error: "The route you requested was not found",
  });
});

const PORT = (process.env.PORT as unknown as number) || 5000;

app.listen(PORT, () => {
  mainLogger.info(`Server listening on port ${PORT}`);
});

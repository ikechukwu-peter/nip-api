import { createLogger, transports, config } from "winston";

export const userLogger = createLogger({
  levels: config.syslog.levels,
  defaultMeta: { component: "user-service" },
  transports: [
    new transports.Console(),
    new transports.File({ filename: "user.log" }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "user.log" }),
  ],
});

export const mainLogger = createLogger({
  levels: config.syslog.levels,
  defaultMeta: { component: "main-app" },
  transports: [
    new transports.Console(),
    new transports.File({ filename: "main.log" }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "main.log" }),
  ],
});

export const urlLogger = createLogger({
  levels: config.syslog.levels,
  defaultMeta: { component: "url-service" },
  transports: [
    new transports.Console(),
    new transports.File({ filename: "url.log" }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "url.log" }),
  ],
});

import pino from "pino";

const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: { env: process.env.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ["req.headers.authorization", "*.password", "*.token", "*.refreshToken"],
      censor: "[REDACTED]",
    },
  },
  process.env.NODE_ENV === "production"
    ? process.stdout
    : pino.transport({
        target: "pino-pretty",
        options: { colorize: true, ignore: "pid,hostname" },
      }),
);

export default logger;

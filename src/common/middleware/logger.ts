import morgan from "morgan";
import { Request, Response } from "express";

// Short clean time (24h format)
morgan.token("time", () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false })
);

export const logger = morgan((tokens, req: Request, res: Response) => {
  const status = Number(tokens.status(req, res));
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const responseTime = tokens["response-time"](req, res);

  // ANSI colors
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  const gray = "\x1b[90m";
  const purple = "\x1b[35m";
  const green = "\x1b[32m";
  const yellow = "\x1b[33m";
  const red = "\x1b[31m";
  const cyan = "\x1b[36m";

  let statusColor = green;
  if (status >= 500) statusColor = red;
  else if (status >= 400) statusColor = yellow;
  else if (status >= 300) statusColor = cyan;

  return [
    gray + tokens.time(req, res) + reset,
    bold + purple + method + reset,
    url,
    statusColor + status + reset,
    gray + responseTime + " ms" + reset,
  ].join(" ");
});
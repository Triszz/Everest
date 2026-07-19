import { Request, Response, NextFunction } from "express";
import morgan from "morgan";

// Custom token: request body (redacted for sensitive routes)
morgan.token("body", (req: Request) => {
  const sensitive = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];
  if (sensitive.includes(req.path)) return "[REDACTED]";
  const raw = req.body;
  if (!raw || Object.keys(raw).length === 0) return "";
  return JSON.stringify(raw);
});

// Custom token: authenticated user id
morgan.token("user", (req: Request) => {
  return (req as any).userId ?? "-";
});

// Combined log format
const format =
  ':method :url :status :res[content-length] - :response-time ms | user::user | body::body';

export const requestLogger = morgan(format, {
  skip: (req: Request) => req.url === "/api/health",
  stream: { write: (message: string) => console.log(message.trim()) },
});

// Alternative pretty format for development — uncomment to use
// const prettyFormat = morgan.compile(
//   ":method :url :status :res[content-length] - :response-time ms\n" +
//   "  user: :user | body: :body\n" +
//   "  ▶ :date[clf]"
// );
// export const requestLogger = morgan(prettyFormat, { skip: (req) => req.url === "/api/health" });

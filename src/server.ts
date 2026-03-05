import express, { Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "@/config/env";
import { errorHandler } from "@/common/middleware/errorHandler";
import authRoutes from "@/modules/auth/auth.routes";
import healthRoutes from "@/modules/health/health.routes";
import userRoutes from "@/modules/users/users.routes";
// import hostelRoutes from "@/modules/hostel/hostel.routes";
import { httpLogger } from "@/common/middleware/httpLogger";

const createApp = (): Express => {
  const app = express();

  // Middlewares
  app.use(helmet()); // Adds security-related HTTP headers to protect from common vulnerabilities.
  // not sure what it does , but clanka said to

  // app.use(cors());
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  );

  app.use(express.json()); // parse incomming req to json  { "name": "Sadit" } -> req.body.name:"Sadit"
  app.use(express.urlencoded({ extended: true })); //name=Sadit&age=20 -> { name: "Sadit", age: "20" }

  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // no ddos for you bijan

  app.use(httpLogger);

  app.get("/", (_req, res) => res.status(200).json({ message: "Hello World" }));

  app.use("/health", healthRoutes);

  app.use("/auth", authRoutes);

  app.use("/users", userRoutes);

  // app.use("/hostel", hostelRoutes);

  // Error handling (must be last)
  app.use(errorHandler);
  return app;
};

const app = createApp();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log(`Environment: ${env.env}`);
  console.log(`ROOT : http://localhost:${env.port}`);
});

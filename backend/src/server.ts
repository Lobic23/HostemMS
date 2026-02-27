import { env } from '@/config/env';
import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./common/middleware/errorHandler";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from './modules/auth/auth.routes';
import healthRoutes from './modules/health/health.routes';
import userRoutes from './modules/users/users.routes';



const createApp = (): Express => {
  const app = express();
  
  // Middlewares
  app.use(helmet());// Adds security-related HTTP headers to protect from common vulnerabilities.
                    // not sure what it does , but clanka said to
  app.use(cors());
  app.use(cookieParser()); // Parses cookies from incoming requests and makes them available in req.cookies.
                          // kinda sad this only works in browser , for android use req.id...
  app.use(express.json()); // parse incomming req to json  { "name": "Sadit" } -> req.body.name:"Sadit"
  app.use(express.urlencoded({ extended: true })); //name=Sadit&age=20 -> { name: "Sadit", age: "20" }
  app.use(morgan("dev")); // logger
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));  // no ddos for you bijan


  app.get('/', (_req, res) => res.status(200).json({ message: 'Hello World' }));

  app.use('/health', healthRoutes);

  app.use('/auth', authRoutes);

  app.use('/users', userRoutes);


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



import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './common/middleware/errorHandler';
import router from 'routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json()); // parse incomming req to json  { "name": "Sadit" } -> req.body.name:"Sadit"
  app.use(express.urlencoded({ extended: true })); //name=Sadit&age=20 -> { name: "Sadit", age: "20" }

  app.use(morgan('dev')); // logger
  app.use('/', router);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
};

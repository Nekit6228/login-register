import dotenv from 'dotenv';
import { getEnvVar } from './utils/getEnvVar.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routers/auth.js'

dotenv.config();

const PORT = Number(getEnvVar('PORT', '3000'));

 export const startServer = () => {
    const app = express();

 app.use(
  express.json({
    type: ['application/json', 'application/vnd.api+json'],
  }),
);

 app.use(
    cors({
      origin: ['http://localhost:3000','https://login-register-front-76mj.vercel.app'],
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

app.get('/', (req, res) => {
    res.json({
      message: 'Hello World!',
    });
  });


app.use(router);

app.use(notFoundHandler);

app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`port ${PORT}`);
  });

 };
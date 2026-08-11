import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import session from 'express-session';
import { fileURLToPath } from 'node:url';
import routesV1 from './routes/v1/index.js';
import webRoutes from './routes/web/index.routes.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net']
      }
    }
  })
);
app.use(cors());
app.use(
  session({
    name: 'ordersweb.sid',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/files', express.static('storage', {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', webRoutes);
app.use('/api/v1', routesV1);
app.use(errorHandler);

export default app;

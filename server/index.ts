import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { prisma, speed, transact } from './db.js';
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.get('origin');
  if (origin && new URL(origin).host !== req.get('host')) {
    res.status(403).json({ error: 'Origin is not allowed.' });
    return;
  }
  next();
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/state', async (_req, res, next) => {
  try {
    res.json({ state: await transact(), serverTime: Date.now(), speed });
  } catch (e) {
    next(e);
  }
});
app.post('/api/action', async (req, res, next) => {
  try {
    const a = req.body;
    if (!a || typeof a.requestId !== 'string' || !a.requestId.length || a.requestId.length > 100)
      throw new Error('A valid request ID is required.');
    res.json({ state: await transact(a), serverTime: Date.now(), speed });
  } catch (e) {
    next(e);
  }
});
app.use(express.static(path.resolve('dist')));
app.get('/{*path}', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
  res.status(400).json({ error: err.message || 'Unable to update village.' });
});
const server = app.listen(Number(process.env.PORT || 3001), '0.0.0.0', () =>
  console.log(`Medieval Kingdoms listening on ${process.env.PORT || 3001} (${speed}× realm)`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      void prisma.$disconnect().then(() => process.exit(0));
    }),
  );

import 'dotenv/config';
import { mkdirSync, closeSync, openSync } from 'node:fs';
import path from 'node:path';
const url = process.env.DATABASE_URL;
if (!url?.startsWith('file:')) throw new Error('DATABASE_URL must point to a SQLite file.');
const file = path.resolve('prisma', url.slice(5));
mkdirSync(path.dirname(file), { recursive: true });
closeSync(openSync(file, 'a'));

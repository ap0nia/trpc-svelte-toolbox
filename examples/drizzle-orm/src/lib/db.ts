import url from 'url'
import path from 'path'
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const sqlite = new Database(path.join(__dirname, '../../rizz/northwind.db'));

const db = drizzle(sqlite);

export default db

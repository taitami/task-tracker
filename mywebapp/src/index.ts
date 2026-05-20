import express from 'express';
import type { Request, Response } from 'express';
import minimist from 'minimist';
import * as mariadb from 'mariadb';

const args = minimist(process.argv.slice(2));

const PORT = args.port || 5200;
const DB_HOST = args.dbhost || '127.0.0.1';
const DB_USER = args.dbuser || 'root';
const DB_PASS = args.dbpass || '';
const DB_NAME = args.dbname || 'mywebapp_db';

export const pool = mariadb.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    connectionLimit: 5
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
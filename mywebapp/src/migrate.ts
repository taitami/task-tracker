import * as mariadb from 'mariadb';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

const DB_HOST = args.dbhost || '127.0.0.1';
const DB_USER = args.dbuser || 'root';
const DB_PASS = args.dbpass || '';
const DB_NAME = args.dbname || 'mywebapp_db';

async function runMigration() {
    console.log(`[Migration]: Connecting to MariaDB at ${DB_HOST}...`);
    
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS,
            database: DB_NAME
        });

        console.log(`[Migration]: Connected successfully to database: ${DB_NAME}`);
        console.log(`[Migration]: Ensuring 'tasks' table exists...`);

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await conn.query(createTableQuery);
        console.log(`[Migration]: Table 'tasks' is ready.`);
        
    } catch (err: any) {
        console.error(`[Migration Error]: ${err.message}`);
        process.exit(1);
    } finally {
        if (conn) {
            await conn.end();
            console.log(`[Migration]: Connection closed.`);
        }
        process.exit(0);
    }
}

runMigration();
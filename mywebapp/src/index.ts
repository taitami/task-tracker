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

function sendContent(req: Request, res: Response, data: any, title: string) {
    const accept = req.headers['accept'] || '';

    if (accept.includes('text/html')) {
        let html = `<!DOCTYPE html><html><head><title>${title}</title><meta charset="utf-8"></head><body>`;
        html += `<h1>${title}</h1>`;
        
        if (Array.isArray(data) && data.length > 0) {
            html += `<table border="1"><tr>`;
            Object.keys(data[0] || {}).forEach(key => html += `<th>${key}</th>`);
            html += `</tr>`;
            data.forEach(row => {
                html += `<tr>`;
                Object.values(row as object).forEach(val => html += `<td>${val}</td>`);
                html += `</tr>`;
            });
            html += `</table>`;
        } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            html += `<ul>`;
            Object.entries(data).forEach(([key, val]) => html += `<li><strong>${key}:</strong> ${val}</li>`);
            html += `</ul>`;
        } else {
            html += `<p>${JSON.stringify(data)}</p>`;
        }
        
        html += `</body></html>`;
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json(data);
}

app.get('/health/alive', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

app.get('/health/ready', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.ping();
        res.status(200).send('OK');
    } catch (err: any) {
        res.status(500).send(`Database connection failed: ${err.message}`);
    } finally {
        if (conn) conn.release();
    }
});

app.get('/tasks', async (req: Request, res: Response) => {
    try {
        const rows = await pool.query('SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC');
        sendContent(req, res, Array.from(rows), 'All Tasks');
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tasks', async (req: Request, res: Response) => {
    const title = req.body.title || req.query.title;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    try {
        const result = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
        sendContent(req, res, { id: Number(result.insertId), title, status: 'pending' }, 'Task Created');
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tasks/:id/done', async (req: Request, res: Response) => {
    const taskId = req.params.id;
    try {
        await pool.query('UPDATE tasks SET status = "done" WHERE id = ?', [taskId]);
        sendContent(req, res, { id: taskId, status: 'done' }, 'Task Updated');
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req: Request, res: Response) => {
    const accept = req.headers['accept'] || '';
    
    if (!accept.includes('text/html') && accept !== '*/*') {
        res.status(406).send('Not Acceptable: This endpoint only provides text/html');
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head><title>MyWebApp API Directory</title><meta charset="utf-8"></head>
    <body>
        <h1>Task Tracker API</h1>
        <ul>
            <li><a href="/tasks">GET /tasks</a> - Вивести усі задачі</li>
            <li>POST /tasks - Створити нову задачу (параметр: title)</li>
            <li>POST /tasks/&lt;id&gt;/done - Змінити статус задачі на виконано</li>
        </ul>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

if (process.env.LISTEN_FDS && parseInt(process.env.LISTEN_FDS) > 0) {
    app.listen({ fd: 3 }, () => {
        console.log(`[server]: Server is running via Systemd Socket Activation`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`[server]: Server is running at http://localhost:${PORT}`);
    });
}
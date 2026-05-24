import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.ts'; 

describe('API Endpoints', () => {
  it('повинен повертати 200 на кореневий ендпоінт', async () => {
    const res = await request(app).get('/').set('Accept', 'text/html');
    expect(res.status).toBe(200);
  });

  it('повинен повертати 200 на /health/alive', async () => {
    const res = await request(app).get('/health/alive');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });
});
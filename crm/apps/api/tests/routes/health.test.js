import { describe, it, expect } from 'vitest';
import app from '../../src/index';
describe('health routes', () => {
    it('GET /healthz', async () => {
        const response = await app.request('/healthz');
        const json = await response.json();
        expect(response.status).toBe(200);
        expect(json).toMatchObject({ status: 'ok' });
    });
    it('GET /api/v1/health', async () => {
        const response = await app.request('/api/v1/health');
        const json = await response.json();
        expect(response.status).toBe(200);
        expect(json).toMatchObject({ status: 'ok' });
    });
    it('GET /api/v1/auth/me는 인증 없을 때 401', async () => {
        const response = await app.request('/api/v1/auth/me');
        expect(response.status).toBe(401);
    });
});
//# sourceMappingURL=health.test.js.map
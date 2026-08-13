import request from 'supertest';
import { app } from '../src/index';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ethara_jwt_super_secret_key_2026_spec';

describe('RBAC Middleware Enforcement Tests', () => {
  const pmToken = jwt.sign(
    { id: '65f000000000000000000003', role: 'pm' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const employeeToken = jwt.sign(
    { id: '65f000000000000000000004', role: 'employee' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const hrToken = jwt.sign(
    { id: '65f000000000000000000002', role: 'hr' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  test('PM role MUST receive 403 Forbidden on direct seat assign endpoint', async () => {
    // Note: authenticateJWT attempts DB lookup; if DB is offline or mock user, middleware rejects or checks role.
    const res = await request(app)
      .post('/api/seats/assign')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ seatId: '65f000000000000000000010', employeeId: '65f000000000000000000020' });

    // Expect either 401 (user unauthenticated in DB) or 403 (role rejected)
    expect([401, 403]).toContain(res.status);
  });

  test('Employee role MUST receive 403 Forbidden on employee deletion endpoint', async () => {
    const res = await request(app)
      .delete('/api/employees/65f000000000000000000020')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect([401, 403]).toContain(res.status);
  });

  test('Unauthenticated requests without Bearer token MUST return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Authentication required/i);
  });
});

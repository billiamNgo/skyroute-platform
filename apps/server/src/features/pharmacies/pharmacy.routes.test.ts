jest.mock('./prisma-pharmacy.service');

jest.mock('./pharmacy.controller', () => {
  return {
    PharmacyController: jest.fn().mockImplementation(() => ({
      ingestOrder: (req: any, res: any) => {
        // controller will only run when middleware allows it, but keep a simple mock
        if (!req.headers.authorization) {
          return res.status(401).json({ message: 'no token cannot create order' });
        }
        return res.status(201).json({ message: 'order created' });
      }
    }))
  };
});

import request from 'supertest';
import express from 'express';
import pharmacyRoutes from './pharmacy.routes';

// simple security middleware mock factory that supports roles
const makeSecurity = () => ({
  authenticateJWT: (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (!auth) return res.sendStatus(401);
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.sendStatus(401);
    // support two test tokens: 'validtoken' => customer, 'pharmacisttoken' => pharmacist
    if (parts[1] === 'validtoken') {
      req.user = { id: 1, role: 'customer' };
      return next();
    }
    if (parts[1] === 'pharmacisttoken') {
      req.user = { id: 2, role: 'pharmacist' };
      return next();
    }
    return res.sendStatus(401);
  },
  isPharmacist: (req: any, res: any, next: any) => {
    if (!req.user) return res.sendStatus(401);
    if (req.user.role === 'pharmacist') return next();
    return res.status(403).json({ status: 'fail', message: 'This action is for pharmacists only' });
  }
});

describe('Pharmacy Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/pharmacy', (pharmacyRoutes as any)(makeSecurity()));
  });

  it('POST /pharmacy/:pharmacyID/new-order without token returns 401', async () => {
    const res = await request(app).post('/pharmacy/1/new-order').send({});
    expect(res.status).toBe(401);
  });

  it('POST /pharmacy/:pharmacyID/new-order with non-pharmacist token returns 403', async () => {
    const res = await request(app)
      .post('/pharmacy/1/new-order')
      .set('Authorization', 'Bearer validtoken')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'This action is for pharmacists only');
  });

  it('POST /pharmacy/:pharmacyID/new-order with pharmacist token returns 201', async () => {
    const res = await request(app)
      .post('/pharmacy/1/new-order')
      .set('Authorization', 'Bearer pharmacisttoken')
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('order created');
  });
});

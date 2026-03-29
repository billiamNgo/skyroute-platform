import express from 'express';
import request from 'supertest';
import createError from 'http-errors';
import { PharmacyController } from './pharmacy.controller';

describe('Pharmacy Controller', () => {
  let app: express.Application;

  it('returns 201 and created order when service succeeds', async () => {
    const mockService: any = {
      ingestOrder: jest.fn().mockResolvedValue({ id: 1, customerFirstName: 'John' })
    };

    const controller = new PharmacyController(mockService);

    app = express();
    app.use(express.json());
    app.post('/pharmacy/:pharmacyID/new-order', controller.ingestOrder);

    const res = await request(app)
      .post('/pharmacy/1/new-order')
      .send({ customerFirstName: 'John', customerLastName: 'Doe', address: '1 Main', city: 'City', state: 'ST', zip: 12345, medicationName: 'Med' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('returns service error status if service throws an http error', async () => {
    const mockService: any = {
      ingestOrder: jest.fn().mockRejectedValue(createError(400, 'Invalid pharmacy ID'))
    };

    const controller = new PharmacyController(mockService);

    app = express();
    app.use(express.json());
    app.post('/pharmacy/:pharmacyID/new-order', controller.ingestOrder);

    const res = await request(app)
      .post('/pharmacy/0/new-order')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid pharmacy ID');
  });
});

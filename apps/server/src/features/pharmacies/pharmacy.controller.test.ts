import express from 'express';
import request from 'supertest';
import createError from 'http-errors';
import { PharmacyController } from './pharmacy.controller';

describe('Pharmacy Controller', () => {
  let app: express.Application;

  // Setup a shared mock service
  const mockService: any = {
    ingestOrder: jest.fn()
  };

  const controller = new PharmacyController(mockService);

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simulate the JWT middleware by manually attaching a user object with pharmacyId to the request
    app.use((req, _res, next) => {
      (req as any).user = { pharmacyId: 101 }; 
      next();
    });

    app.post('/pharmacy/new-order', controller.ingestOrder);
    jest.clearAllMocks();
  });

  it('returns 201 and created order when service succeeds', async () => {
    const mockOrder = { id: 1, customerFirstName: 'John' };
    mockService.ingestOrder.mockResolvedValue(mockOrder);

    const payload = { 
        customerFirstName: 'John', 
        customerLastName: 'Doe', 
        address: '1 Main', 
        city: 'City', 
        state: 'ST', 
        zip: 12345, 
        medicationName: 'Med' 
    };

    const res = await request(app)
      .post('/pharmacy/new-order')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockOrder);
    // Verify the service was called with the pharmacyId from our "JWT"
    expect(mockService.ingestOrder).toHaveBeenCalledWith(101, payload);
  });

  it('returns service error status if service throws an http error', async () => {
    mockService.ingestOrder.mockRejectedValue(createError(400, 'Invalid data'));

    const res = await request(app)
      .post('/pharmacy/new-order')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid data');
  });
});
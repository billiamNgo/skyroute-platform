import express from 'express';
import request from 'supertest';
import orderRoutes from './order.routes';
import { PrismaOrderService } from './prisma-order.service';

describe('Order Routes Integration', () => {
    let app: express.Application;
    
    // Mock Security Middleware
    const mockSecurity = {
        authenticateJWT: jest.fn((req, res, next) => {
            (req as any).user = { pharmacyId: 1 };
            next();
        }),
    isStaff: jest.fn((req, res, next) => next()),
    };

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/orders', orderRoutes(mockSecurity));
    });

    it('GET /orders should trigger security and return 200', async () => {
        // We mock the service method prototype to avoid DB calls
        const { PrismaOrderService } = require('./prisma-order.service');
        jest.spyOn(PrismaOrderService.prototype, 'getOrdersByPharmacy').mockResolvedValue([]);

        const response = await request(app).get('/orders');
        
        expect(mockSecurity.authenticateJWT).toHaveBeenCalled();
        expect(mockSecurity.isStaff).toHaveBeenCalled();
        expect(response.status).toBe(200);
    });

    it('POST /orders/assign/:id should parse body and params', async () => {
        const spy = jest.spyOn(PrismaOrderService.prototype, 'assignDrone').mockResolvedValue({} as any);

        const response = await request(app)
            .post('/orders/assign/50')
            .send({ droneId: 99 });

        expect(spy).toHaveBeenCalledWith(50, 99, 1);
        expect(response.status).toBe(200);
    });
});
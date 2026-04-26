import express from 'express';
import request from 'supertest';
import userRoutes from './user.routes';
import { PrismaUserService } from './prisma-user.service';

describe('User Routes Integration', () => {
    let app: express.Application;
    
    // Mock Security Middleware
    const mockSecurity = {
        authenticateJWT: jest.fn((req, res, next) => {
            (req as any).user = { userID: 1, pharmacyId: 1, role: 'admin' };
            next();
        }),
        isAdmin: jest.fn((req, res, next) => next()),
        isStaff: jest.fn((req, res, next) => next()),
    };

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/users', userRoutes(mockSecurity));
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /users/profile should trigger security and return 200', async () => {
        const spy = jest.spyOn(PrismaUserService.prototype, 'getUserProfile').mockResolvedValue({ userID: 1 } as any);

        const response = await request(app).get('/users/profile');
        
        expect(mockSecurity.authenticateJWT).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(1);
        expect(response.status).toBe(200);
    });

    it('GET /users should trigger security and return unassigned users', async () => {
        const spy = jest.spyOn(PrismaUserService.prototype, 'getUnassignedUsers').mockResolvedValue([]);

        const response = await request(app).get('/users');
        
        expect(mockSecurity.authenticateJWT).toHaveBeenCalled();
        expect(mockSecurity.isAdmin).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(response.status).toBe(200);
    });

    it('PATCH /users/profile should trigger security and update profile', async () => {
        const spy = jest.spyOn(PrismaUserService.prototype, 'updateUserProfile').mockResolvedValue({ userID: 1 } as any);

        const response = await request(app)
            .patch('/users/profile')
            .send({ firstName: 'NewName' });
        
        expect(mockSecurity.authenticateJWT).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(1, { firstName: 'NewName' });
        expect(response.status).toBe(200);
    });

    it('PATCH /users/:id/pharmacy should trigger security and assign pharmacy', async () => {
        const spy = jest.spyOn(PrismaUserService.prototype, 'assignUserToPharmacy').mockResolvedValue({ userID: 2 } as any);

        const response = await request(app)
            .patch('/users/2/pharmacy');
        
        expect(mockSecurity.authenticateJWT).toHaveBeenCalled();
        expect(mockSecurity.isAdmin).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(2, 1);
        expect(response.status).toBe(200);
    });
});

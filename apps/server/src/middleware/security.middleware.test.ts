jest.mock('../features/token/token.service');

import request from 'supertest';
import express, { Request } from 'express';
import SecurityMiddleware from './security.middleware';
import TokenService from '../features/token/token.service';

const MockedTokenService = TokenService as jest.MockedClass<typeof TokenService>;

declare module 'express' {
  interface Request {
    user?: any;
  }
}

describe('SecurityMiddleware', () => {
    let app: express.Application;
    let tokenServiceMock: jest.Mocked<TokenService>;

    beforeEach(() => {
        tokenServiceMock = {
            verifyToken: jest.fn(),
            generateToken: jest.fn(),
        } as unknown as jest.Mocked<TokenService>;

        const securityMiddleware = SecurityMiddleware(tokenServiceMock);

        app = express();
        app.use(express.json());
        app.use(securityMiddleware.authenticateJWT);
        app.get('/test', (req: Request, res) => {
            res.status(200).json({ message: 'Success', user: req.user });
        });
    });

    it('should return 401 if no authorization header is present', async () => {
        const response = await request(app).get('/test');
        expect(response.status).toBe(401);
    });

    it('should return 401 if token is invalid', async () => {
        tokenServiceMock.verifyToken.mockResolvedValue(null);

        const response = await request(app)
            .get('/test')
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(401);
    });

    it('should call next and attach user to request if token is valid', async () => {
        const tokenResponse = { user: { id: 1, name: 'Test User' } };
        tokenServiceMock.verifyToken.mockResolvedValue(tokenResponse);

        const response = await request(app)
            .get('/test')
            .set('Authorization', 'Bearer validtoken');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Success',
            user: tokenResponse.user
        });
    });
});
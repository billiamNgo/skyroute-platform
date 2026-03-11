jest.mock('./prisma-auth.service');

jest.mock('./auth.controller', () => {
  return {
    AuthController: jest.fn().mockImplementation(() => ({
      register: (req: any, res: any) => res.status(201).json({ message: 'registered' }),
      login: (req: any, res: any) => res.status(200).json({ message: 'logged in' }),
      logout: (req: any, res: any) => {
        if (!req.headers.authorization) {
          return res.status(401).json({ message: 'no token cannot log out' });
        }
        res.json({ message: 'logged out' });
      }
    }))
  };
});

import request from 'supertest';
import express from 'express';
import router from './auth.routes';

const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Routes', () => {
    it('POST /auth/register returns 201', async () => {
        const res = await request(app).post('/auth/register').send({
            email: 'fakeaccount@accounts.com',
            firstName: 'fake',
            lastName: 'account',
            password: 'testPassword123',
            role: 'customer'
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('registered');
    });

    it('POST /auth/login returns 200', async () => {
        const res = await request(app).post('/auth/login').send({
            email: 'fakeaccount@accounts.com',
            password: 'testPassword123'
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('logged in');
    });

    it('POST /auth/logout without token returns 401', async () => {
        const res = await request(app).post('/auth/logout');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('no token cannot log out');
    });

    it('post /auth/logout with token reutrns 200', async () => {
        const res = await request(app).post('/auth/logout').set('Authorization', 'Bearer faketoken');

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('logged out')
    })
});
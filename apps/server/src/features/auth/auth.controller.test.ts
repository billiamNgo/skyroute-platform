import { AuthController } from './auth.controller';
import { Request, Response } from 'express';

describe('AuthController', () => {
    let mockAuthService: any;
    let authController: AuthController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        mockAuthService = {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn()
        };
        authController = new AuthController(mockAuthService);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });


    describe('register', () => {
        const userBody = {
            email: 'fakeaccount@accounts.com',
            firstName: 'fake',
            lastName: 'account',
            password: 'testPassword123',
            role: 'customer'
        };

        it('calls authService.register with req.body', async () => {
            req = { body: userBody };
            mockAuthService.register.mockResolvedValue(userBody);

            await authController.register(req as Request, res as Response);

            expect(mockAuthService.register).toHaveBeenCalledWith(userBody);
        });

        it('returns 201 and the created user on success', async () => {
            req = { body: userBody };
            mockAuthService.register.mockResolvedValue(userBody);

            await authController.register(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(userBody);
        });

        it('propagates error when authService.register throws', async () => {
            req = { body: userBody };
            const error = new Error('Email already in use');
            mockAuthService.register.mockRejectedValue(error);

            await expect(
                authController.register(req as Request, res as Response)
            ).rejects.toThrow('Email already in use');
        });
    });


    describe('login', () => {
        const loginBody = {
            email: 'fakeaccount@accounts.com',
            password: 'testPassword123'
        };
        const loginResult = {
            user: {
                email: 'fakeaccount@accounts.com',
                firstName: 'fake',
                lastName: 'account',
                role: 'customer'
            },
            token: 'faketoken'
        };

        it('calls authService.login with req.body', async () => {
            req = { body: loginBody };
            mockAuthService.login.mockResolvedValue(loginResult);

            await authController.login(req as Request, res as Response);

            expect(mockAuthService.login).toHaveBeenCalledWith(loginBody);
        });

        it('returns 200 with user and token on success', async () => {
            req = { body: loginBody };
            mockAuthService.login.mockResolvedValue(loginResult);

            await authController.login(req as Request, res as Response);

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(loginResult);
        });

        it('propagates error when authService.login throws', async () => {
            req = { body: loginBody };
            mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

            await expect(
                authController.login(req as Request, res as Response)
            ).rejects.toThrow('Invalid credentials');
        });
    });


    describe('logout', () => {
        it('returns 401 when authorization header is absent', async () => {
            req = { headers: {} };

            await authController.logout(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
            expect(mockAuthService.logout).not.toHaveBeenCalled();
        });

        it('returns 401 when authorization header has no token after Bearer', async () => {
            req = { headers: { authorization: 'Bearer ' } };

            await authController.logout(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
            expect(mockAuthService.logout).not.toHaveBeenCalled();
        });

        it('calls authService.logout with the stripped token', async () => {
            req = { headers: { authorization: 'Bearer faketoken' } };
            mockAuthService.logout.mockResolvedValue(undefined);

            await authController.logout(req as Request, res as Response);

            expect(mockAuthService.logout).toHaveBeenCalledWith('faketoken');
        });

        it('returns success message on valid logout', async () => {
            req = { headers: { authorization: 'Bearer faketoken' } };
            mockAuthService.logout.mockResolvedValue(undefined);

            await authController.logout(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
        });

        it('propagates error when authService.logout throws', async () => {
            req = { headers: { authorization: 'Bearer faketoken' } };
            mockAuthService.logout.mockRejectedValue(new Error('Token invalidation failed'));

            await expect(
                authController.logout(req as Request, res as Response)
            ).rejects.toThrow('Token invalidation failed');
        });
    });
});
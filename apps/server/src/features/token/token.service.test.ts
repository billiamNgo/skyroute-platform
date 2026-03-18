// Implemented with Github Copilot

jest.mock('jsonwebtoken');

import jwt from 'jsonwebtoken';
import TokenService from './token.service';

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('TokenService', () => {
    let tokenService: TokenService;
    const jwtSecret = 'test-secret';
    const expiresIn = '1h';

    beforeEach(() => {
        tokenService = new TokenService(mockedJwt, jwtSecret, expiresIn);
    });

    describe('generateToken', () => {
        it('should generate a token with the provided user', async () => {
            const user = { id: 1, name: 'Test User' };
            const expectedToken = 'mocked-token';
            mockedJwt.sign.mockImplementation(() => expectedToken as any);

            const result = await tokenService.generateToken(user);

            expect(mockedJwt.sign).toHaveBeenCalledWith(
                { user },
                jwtSecret,
                { expiresIn }
            );
            expect(result).toBe(expectedToken);
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token and return the payload', async () => {
            const token = 'valid-token';
            const payload = { user: { id: 1, name: 'Test User' } };
            mockedJwt.verify.mockImplementation(() => payload as any);

            const result = await tokenService.verifyToken(token);

            expect(mockedJwt.verify).toHaveBeenCalledWith(token, jwtSecret);
            expect(result).toBe(payload);
        });

        it('should return null for an invalid token', async () => {
            const token = 'invalid-token';
            mockedJwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = await tokenService.verifyToken(token);

            expect(mockedJwt.verify).toHaveBeenCalledWith(token, jwtSecret);
            expect(result).toBeNull();
        });
    });
});
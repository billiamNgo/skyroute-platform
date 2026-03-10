import { Router } from 'express';
import { AuthController } from './auth.controller';
import { PrismaAuthService } from './prisma-auth.service';
import TokenService from '../token/token.service';

const router = Router();

// Dependency injection for AuthService and AuthController
const authService = new PrismaAuthService(new TokenService(require('jsonwebtoken'), process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN!));
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
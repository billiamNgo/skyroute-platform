import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
    constructor(private authService: AuthService) {}
    
    register = async (req: Request, res: Response) => {
        const User = await this.authService.register(req.body);
        res.status(201).json(User);
    }

    login = async (req: Request, res: Response) => {
        const { user, token } = await this.authService.login(req.body);
        res.json({ user, token });
    }

    logout = async (req: Request, res: Response) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        await this.authService.logout(token);
        res.json({ message: 'Logged out successfully' });
    }
}
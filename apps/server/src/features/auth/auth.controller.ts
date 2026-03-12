import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
    constructor(private authService: AuthService) {}
    
    register = async (req: Request, res: Response) => {
        const User = await this.authService.register(req.body);
        res.status(201).json(User);
    }

    login = async (req: Request, res: Response) => {
        try {
            const { user, token } = await this.authService.login(req.body);
            return res.json({ user, token });
        } catch (error: any) {
            // Map authentication failures to a 401 with a client-friendly message
            const invalid = /invalid/i;
            if (error?.message && invalid.test(error.message)) {
                return res.status(401).json({ message: 'Invalid Credentials' });
            }

            // For other errors, log and return a generic 500
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    logout = async (req: Request, res: Response) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        await this.authService.logout(token);
        res.json({ message: 'Logged out successfully' });
    }
}
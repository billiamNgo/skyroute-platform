import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthService, PublicUser } from './auth.service';
import TokenService from '../token/token.service';
import { Login } from '@shared/login.model';
import bcrypt from 'bcryptjs';
import { User } from '@shared/user.model';

export class PrismaAuthService implements AuthService {
    private prisma: PrismaClient;
    
    constructor(private tokenService: TokenService) {
        console.log('Database url:', process.env.DATABASE_URL);

        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }
    
    async register(userData: User): Promise<PublicUser> {
        console.log('Userdata received: ', userData);
        try {
            // hash the password before saving
            const hashed = await bcrypt.hash(userData.password, 10);

            const created = await this.prisma.user.create({
                data: {
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    password: hashed,
                    role: userData.role,
                },
            });

            // remove password before returning
            const { password: _p, ...safe } = created;
            return safe as PublicUser;
        } catch (error: any) {
            console.error('Full error:', JSON.stringify(error, null, 2));
            console.error('Error code:', error.code);
            console.error('Error meta:', error.meta);
            console.error('Error message:', error.message);
            throw error;
        }
    }

    async login(credential: Login): Promise<{ user: PublicUser; token: string }> {
        const { email, password } = credential;
        const user = await this.prisma.user.findUnique({
            where: { email } 
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // compare supplied password with stored hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error('Invalid credentials');
        }

        const token = await this.tokenService.generateToken(user);

        // strip password from returned user
        const { password: _p, ...safe } = user;
        return { user: safe as PublicUser, token };
    }

    async logout(token: string): Promise<void> {
        // Add token to revoke list so future use is rejected
        try {
            if (typeof (this.tokenService as any).revokeToken === 'function') {
                await (this.tokenService as any).revokeToken(token);
            }
        } catch (err) {
            console.error('Error revoking token', err);
        }
    }
}
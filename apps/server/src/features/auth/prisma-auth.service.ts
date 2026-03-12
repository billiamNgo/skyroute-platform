import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthService } from './auth.service';
import TokenService from '../token/token.service';
import { Login } from '@shared/login.model';
import { User } from '@shared/user.model';

export class PrismaAuthService implements AuthService {
    private prisma: PrismaClient;
    
    constructor(private tokenService: TokenService) {
        console.log('Database url:', process.env.DATABASE_URL);

        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }
    
    async register(userData: User): Promise<User> {
        console.log('Userdata received: ', userData);
        return await this.prisma.user.create({
            data: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                password: userData.password,
                role: userData.role,
            },
        });
    }

    async login(credential: Login): Promise<{ user: User; token: string }> {
        const { email, password } = credential;
        const user = await this.prisma.user.findUnique({
            where: { email } 
        });

        if (!user || user.password !== password) {
            throw new Error('Invalid credentials');
        }

        const token = await this.tokenService.generateToken(user);
        return { user, token };
    }

    async logout(token: string): Promise<void> {
        // Invalidate token here
    }
}
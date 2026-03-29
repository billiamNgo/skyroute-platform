import { User } from '@shared/user.model'
import { Login } from '@shared/login.model'

export type PublicUser = Omit<User, 'password'>;

export interface AuthService {
    register(userData: User): Promise<PublicUser>;
    login(credential: Login): Promise<{ user: PublicUser; token: string }>;
    logout(token: string): Promise<void>;
}
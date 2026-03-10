import { User } from '@shared/user.model'
import { Login } from '@shared/login.model'

export interface AuthService {
    register(userData: User): Promise<User>;
    login(credential: Login): Promise<{ user: User; token: string }>;
    logout(token: string): Promise<void>;
}
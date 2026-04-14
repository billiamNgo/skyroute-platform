import { User } from '@shared/user.model';

export interface UserService {
    updateUserProfile(userId: number, updateData: Partial<User>): Promise<User>;
    assignUserToPharmacy(userId: number, pharmacyId: number): Promise<User>;
}
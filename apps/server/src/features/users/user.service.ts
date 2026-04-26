import { User } from '@shared/user.model';

export interface UserService {
    getUserProfile(userId: number): Promise<User>;
    getUnassignedUsers(): Promise<User[]>;
    updateUserProfile(userId: number, updateData: Partial<User>): Promise<User>;
    assignUserToPharmacy(userId: number, pharmacyId: number): Promise<User>;
}
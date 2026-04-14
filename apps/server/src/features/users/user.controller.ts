import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
    constructor(private userService: UserService) {}

    updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = Number(req.user.userID); // Extracted from JWT payload
            const updatedUser = await this.userService.updateUserProfile(userId, req.body);
            return res.json(updatedUser);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };

    assignPharmacy = async (req: Request, res: Response) => {
        try {
            const targetUserId = Number(req.params.id);
            const adminPharmacyId = Number(req.user.pharmacyId); // Admin's own pharmacy context

            if (!adminPharmacyId) {
                return res.status(400).json({ message: 'Admin user must belong to a pharmacy to assign users' });
            }

            const updatedUser = await this.userService.assignUserToPharmacy(targetUserId, adminPharmacyId);
            return res.json(updatedUser);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };
}
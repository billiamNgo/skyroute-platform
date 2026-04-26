import { UserController } from './user.controller';
import { Request, Response } from 'express';

describe('UserController', () => {
    let mockUserService: any;
    let userController: UserController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        mockUserService = {
            getUserProfile: jest.fn(),
            updateUserProfile: jest.fn(),
            assignUserToPharmacy: jest.fn(),
            getUnassignedUsers: jest.fn(),
        };
        userController = new UserController(mockUserService);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getProfile', () => {
        it('should return user profile based on req.user.userID', async () => {
            req = { user: { userID: 1 } };
            const userProfile = { userID: 1, email: 'test@test.com' };
            mockUserService.getUserProfile.mockResolvedValue(userProfile);

            await userController.getProfile(req as Request, res as Response);

            expect(mockUserService.getUserProfile).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(userProfile);
        });

        it('should return 500 if an error occurs', async () => {
            req = { user: { userID: 1 } };
            mockUserService.getUserProfile.mockRejectedValue(new Error('Internal error'));

            await userController.getProfile(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal error' });
        });
    });

    describe('updateProfile', () => {
        it('should update user profile based on req.user.userID', async () => {
            req = { 
                user: { userID: 1 },
                body: { firstName: 'Updated' }
            };
            const updatedUser = { userID: 1, firstName: 'Updated' };
            mockUserService.updateUserProfile.mockResolvedValue(updatedUser);

            await userController.updateProfile(req as Request, res as Response);

            expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(1, { firstName: 'Updated' });
            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('assignPharmacy', () => {
        it('should assign user to pharmacy if admin has pharmacyId', async () => {
            req = { 
                params: { id: '2' },
                user: { pharmacyId: 10 }
            };
            const updatedUser = { userID: 2, pharmacyID: 10 };
            mockUserService.assignUserToPharmacy.mockResolvedValue(updatedUser);

            await userController.assignPharmacy(req as Request, res as Response);

            expect(mockUserService.assignUserToPharmacy).toHaveBeenCalledWith(2, 10);
            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });

        it('should return 400 if admin has no pharmacyId', async () => {
            req = { 
                params: { id: '2' },
                user: { pharmacyId: undefined }
            };

            await userController.assignPharmacy(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Admin user must belong to a pharmacy to assign users' });
        });
    });

    describe('getUnassignedUsers', () => {
        it('should return list of unassigned users', async () => {
            req = {};
            const unassignedUsers = [{ userID: 3, pharmacyID: null }];
            mockUserService.getUnassignedUsers.mockResolvedValue(unassignedUsers);

            await userController.getUnassignedUsers(req as Request, res as Response);

            expect(mockUserService.getUnassignedUsers).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(unassignedUsers);
        });
    });
});

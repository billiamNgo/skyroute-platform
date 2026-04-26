import { PrismaUserService } from './prisma-user.service';
import bcrypt from 'bcryptjs';

describe('PrismaUserService', () => {
    let service: PrismaUserService;

    beforeEach(() => {
        service = new PrismaUserService();
        // Mock Prisma
        (service as any).prisma = {
            user: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
            },
            pharmacies: {
                findUnique: jest.fn(),
            }
        };
    });

    describe('getUserProfile', () => {
        it('should return user without password', async () => {
            const user = { userID: 1, email: 'test@test.com', password: 'hashedpassword' };
            (service as any).prisma.user.findUnique.mockResolvedValue(user);

            const result = await service.getUserProfile(1);

            expect(result).not.toHaveProperty('password');
            expect(result.email).toBe('test@test.com');
        });

        it('should throw 404 if user not found', async () => {
            (service as any).prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.getUserProfile(1)).rejects.toHaveProperty('status', 404);
        });
    });

    describe('updateUserProfile', () => {
        it('should hash password and update user', async () => {
            const user = { userID: 1, email: 'test@test.com' };
            (service as any).prisma.user.findUnique.mockResolvedValue(user);
            (service as any).prisma.user.update.mockResolvedValue({ ...user, firstName: 'Updated' });
            
            const bcryptSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('newhashedpassword' as never);

            const result = await service.updateUserProfile(1, { password: 'newpassword', firstName: 'Updated' });

            expect(bcryptSpy).toHaveBeenCalledWith('newpassword', 10);
            expect((service as any).prisma.user.update).toHaveBeenCalledWith({
                where: { userID: 1 },
                data: expect.objectContaining({
                    password: 'newhashedpassword',
                    firstName: 'Updated'
                })
            });
            expect(result.firstName).toBe('Updated');
        });
    });

    describe('assignUserToPharmacy', () => {
        it('should assign user to pharmacy', async () => {
            (service as any).prisma.pharmacies.findUnique.mockResolvedValue({ pharmacyID: 10 });
            (service as any).prisma.user.findUnique.mockResolvedValue({ userID: 2 });
            (service as any).prisma.user.update.mockResolvedValue({ userID: 2, pharmacyID: 10 });

            const result = await service.assignUserToPharmacy(2, 10);

            expect(result.pharmacyID).toBe(10);
        });

        it('should throw 404 if pharmacy not found', async () => {
            (service as any).prisma.pharmacies.findUnique.mockResolvedValue(null);

            await expect(service.assignUserToPharmacy(2, 10)).rejects.toHaveProperty('status', 404);
        });
    });

    describe('getUnassignedUsers', () => {
        it('should return users with pharmacyID null', async () => {
            const users = [
                { userID: 1, email: 'u1@t.com', password: 'p1', pharmacyID: null },
                { userID: 2, email: 'u2@t.com', password: 'p2', pharmacyID: null },
            ];
            (service as any).prisma.user.findMany.mockResolvedValue(users);

            const result = await service.getUnassignedUsers();

            expect(result).toHaveLength(2);
            expect(result[0]).not.toHaveProperty('password');
            expect((service as any).prisma.user.findMany).toHaveBeenCalledWith({
                where: { pharmacyID: null }
            });
        });
    });
});

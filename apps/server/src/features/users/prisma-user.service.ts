import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { User } from "@shared/user.model";
import { UserService } from "./user.service";
import bcrypt from 'bcryptjs';
import createError from 'http-errors';

export class PrismaUserService implements UserService {
    private prisma: PrismaClient;

    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }

    async getUserProfile(userId: number): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { userID: userId } });
        if (!user) {
            throw createError(404, "User not found");
        }
        const { password, ...safeUser } = user;
        return safeUser as User;
    }

    async updateUserProfile(userId: number, updateData: Partial<User>): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { userID: userId } });
        if (!user) {
            throw createError(404, "User not found");
        }

        const dataToUpdate: any = { ...updateData };

        // If password is being updated, hash it before saving
        if (updateData.password) {
            dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
        }

        // Prevent manual pharmacy assignment or role escalation through profile update
        delete dataToUpdate.pharmacyID;
        delete dataToUpdate.userID;
        delete dataToUpdate.role;

        const updated = await this.prisma.user.update({
            where: { userID: userId },
            data: dataToUpdate
        });

        const { password, ...safeUser } = updated;
        return safeUser as User;
    }

    async assignUserToPharmacy(userId: number, pharmacyId: number): Promise<User> {
        // Validate pharmacy exists
        const pharmacy = await this.prisma.pharmacies.findUnique({ where: { pharmacyID: pharmacyId } });
        if (!pharmacy) {
            throw createError(404, "Pharmacy not found");
        }

        const user = await this.prisma.user.findUnique({ where: { userID: userId } });
        if (!user) {
            throw createError(404, "Target user not found");
        }

        const updated = await this.prisma.user.update({
            where: { userID: userId },
            data: { pharmacyID: pharmacyId }
        });

        const { password, ...safeUser } = updated;
        return safeUser as User;
    }

    async getUnassignedUsers(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                pharmacyID: null
            }
        });

        return users.map(({ password, ...safeUser }) => safeUser as User);
    }
}
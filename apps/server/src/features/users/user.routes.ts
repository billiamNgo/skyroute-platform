import { Router } from 'express';
import { UserController } from './user.controller';
import { PrismaUserService } from './prisma-user.service';

export default function userRoutes(security: any) {
    const router = Router();

    // Dependency injection for UserService into UserController
    const service = new PrismaUserService();
    const controller = new UserController(service);

    router.use(security.authenticateJWT);

    // PATCH /users/profile - allow any authenticated user to update their own profile
    router.patch('/profile',
        security.isStaff,
        controller.updateProfile
    );

    // PATCH /users/:id/pharmacy - allow Admins to claim users for their pharmacy
    router.patch('/:id/pharmacy',
        security.isAdmin,
        controller.assignPharmacy
    );

    return router;
}
import { Router } from 'express';
import { UserController } from './user.controller';
import { PrismaUserService } from './prisma-user.service';

export default function userRoutes(security: any) {
    const router = Router();

    // Dependency injection for UserService into UserController
    const service = new PrismaUserService();
    const controller = new UserController(service);

    // GET /users/profile - retrieve the logged in user's profile
    router.get('/profile',
        security.authenticateJWT,
        controller.getProfile
    );

    // GET /users - allow Admins to search for unassigned users
    router.get('/',
        security.authenticateJWT,
        security.isAdmin,
        controller.getUnassignedUsers
    );

    // PATCH /users/profile - allow any authenticated user to update their own profile
    router.patch('/profile',
        security.authenticateJWT,
        controller.updateProfile
    );

    // PATCH /users/:id/pharmacy - allow Admins to claim users for their pharmacy
    router.patch('/:id/pharmacy',
        security.authenticateJWT,
        security.isAdmin,
        controller.assignPharmacy
    );

    return router;
}
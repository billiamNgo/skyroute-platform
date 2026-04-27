import { Router } from 'express';
import { DroneController } from './drone.controller';
import { PrismaDroneService } from './prisma-drone.service';

export default function droneRoutes(security: any) {
    const router = Router();

    // Dependency injection for DroneService into DroneController
    const service = new PrismaDroneService();
    const controller = new DroneController(service);

    // GET /drones
    router.get('/',
        security.authenticateJWT,
        security.isStaff,
        controller.getAllDrones
    );

    // GET /drones/:id
    router.get('/:id',
        security.authenticateJWT,
        security.isStaff,
        controller.getDrone
    );

    // GET /drones/tracking/fleet
    router.get('/tracking/fleet',
        security.authenticateJWT,
        security.isStaff,
        controller.trackFleet
    );

    // GET /drones/:id/track
    router.get('/:id/track',
        security.authenticateJWT,
        security.isStaff,
        controller.trackDrone
    );

    // POST /drones/:id/status
    router.post('/:id/status', 
        security.authenticateJWT,
        security.isStaff, 
        controller.updateStatus
    );

    return router;
}
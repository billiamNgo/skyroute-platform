import { Router } from 'express';
import { OrderController } from './order.controller';
import { PrismaOrderService } from './prisma-order.service';
import { SocketService } from '../realtime/socket.service';
import { DefaultMissionService } from '../delivery/default-mission.service';
import { GeocodingService } from '../../services/geocoding/geocoding.service';

export default function orderRoutes(security: any, socketService: SocketService) {
    const router = Router();

    // Instantiating dependencies for order routes
    const orderService = new PrismaOrderService();
    const geocodingService = new GeocodingService();
    
    // Dependency injection for mission service
    const missionService = new DefaultMissionService(orderService, socketService, geocodingService);
    
    // Dependency injection for order controller
    const controller = new OrderController(orderService, missionService);

    router.get('/', 
        security.authenticateJWT,
        security.isStaff,
        controller.getAllOrders
    );

    router.get('/:id', 
        security.authenticateJWT,
        security.isStaff,
        controller.getOrder
    );

    router.post('/assign/:id', 
        security.authenticateJWT,
        security.isStaff,
        controller.assignOrder
    );

    return router;
}
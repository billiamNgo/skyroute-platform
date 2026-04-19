import { Router } from 'express';
import { OrderController } from './order.controller';
import { PrismaOrderService } from './prisma-order.service';
import { SocketService } from '../realtime/socket.service';

export default function orderRoutes(security: any, socketService: SocketService) {
    const router = Router();

    // Dependency injection for OrderService into OrderController
    const service = new PrismaOrderService();
    const controller = new OrderController(service, socketService);

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
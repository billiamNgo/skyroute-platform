import { Router } from 'express';
import { OrderController } from './order.controller';
import { PrismaOrderService } from './prisma-order.service';

const router = Router();

// Dependency injection for OrderService into OrderController
const service = new PrismaOrderService();
const controller = new OrderController(service);

router.get('/', controller.getAllOrders);
router.get('/:id', controller.getOrder);
router.post('/assign/:id', controller.assignOrder);

export default router;
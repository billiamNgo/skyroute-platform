import { Request, Response } from 'express';
import { OrderService } from './order.service';

export class OrderController {
    constructor(
        private orderService: OrderService
    ) {}

    getAllOrders = async (req: Request, res: Response) => {
        try {
            const pharmacyId = Number((req as any).user.pharmacyId);
            const status = req.query.status as any;

            const orders = await this.orderService.getOrdersByPharmacy(pharmacyId, status);
            return res.json(orders);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };

    getOrder = async (req: Request, res: Response) => {
        try {
            const order = await this.orderService.getOrderById(Number(req.params.id), Number((req as any).user.pharmacyId));
            return res.json(order);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };

    assignOrder = async (req: Request, res: Response) => {
        try {
            const { droneId } = req.body;
            const pharmacyId = Number((req as any).user.pharmacyId);
            const updatedOrder = await this.orderService.assignDrone(Number(req.params.id), droneId, pharmacyId);
            
            // Note: The eventBus in PrismaOrderService handles background dispatching
            return res.json(updatedOrder);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };
}
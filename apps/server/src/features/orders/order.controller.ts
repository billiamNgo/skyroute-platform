import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { MissionService } from '../delivery/mission.service';

export class OrderController {
    constructor(
        private orderService: OrderService,
        private missionService: MissionService
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
            const orderId = Number(req.params.id);
            
            // Delegate mission orchestration to the MissionService
            await this.missionService.assignMission(orderId, droneId, pharmacyId);
            
            // Return updated order for UI feedback
            const updatedOrder = await this.orderService.getOrderById(orderId, pharmacyId);
            return res.json(updatedOrder);
        } catch (error: any) {
            console.error('Assignment error:', error);
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };
}
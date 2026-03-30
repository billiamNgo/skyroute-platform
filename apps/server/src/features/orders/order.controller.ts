import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { OrderStatus } from '@shared/order.model';

export class OrderController {
    constructor(private orderService: OrderService) {}

    getAllOrders = async (req: Request, res: Response) => {
        try {
            const pharmacyId = (req as any).user.pharmacyId; 
            const status = req.query.status as OrderStatus;

            const orders = await this.orderService.getOrdersByPharmacy(pharmacyId, status);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving orders" });
        }
    };

    getOrder = async (req: Request, res: Response) => {
        try {
            const order = await this.orderService.getOrderById(Number(req.params.id));
            if (!order) return res.status(404).json({ message: "Order not found" });
            res.json(order);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving order details" });
        }
    };

    assignOrder = async (req: Request, res: Response) => {
        try {
            const { droneId } = req.body;
            const updatedOrder = await this.orderService.assignDrone(Number(req.params.id), droneId);
            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: "Assignment failed" });
        }
    };
}
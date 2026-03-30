import { PrismaClient } from '@prisma/client';
import { Order, OrderStatus } from '@shared/order.model';
import { OrderService } from './order.service';

export class PrismaOrderService implements OrderService {
    private prisma = new PrismaClient();

    async getOrdersByPharmacy(pharmacyId: number, status?: OrderStatus): Promise<Order[]> {
        return await this.prisma.orders.findMany({
            where: {
                pharmacyID: pharmacyId,
                ...(status && { status: status })
            }
        }) as Order[];
    }

    async getOrderById(orderId: number): Promise<Order | null> {
        return await this.prisma.orders.findUnique({
            where: { orderID: orderId }
        }) as Order | null;
    }

    async assignDrone(orderId: number, droneId: number): Promise<Order> {
        return await this.prisma.orders.update({
            where: { orderID: orderId },
            data: { 
                droneID: droneId,
                status: OrderStatus.IN_TRANSIT 
            }
        }) as Order;
    }
}
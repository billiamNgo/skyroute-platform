import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Order, OrderStatus } from '@shared/order.model';
import { OrderService } from './order.service';
import createError from 'http-errors';

export class PrismaOrderService implements OrderService {
    private prisma: PrismaClient;

    constructor() {
        console.log('Database url:', process.env.DATABASE_URL);
        
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }

    async getOrdersByPharmacy(pharmacyId: number, status?: OrderStatus): Promise<Order[]> {
        // Validate PharmacyID is present and a positive integer
        if (isNaN(pharmacyId) || pharmacyId <= 0) {
            throw createError(400, 'Invalid pharmacy ID');
        }
        
        // Validate that Pharmacy Exists
        const pharmacy = await this.prisma.pharmacies.findUnique({
            where: { pharmacyID: pharmacyId }
        });
        if (!pharmacy) {
            throw createError(404, "Pharmacy not found");
        }
        
        return await this.prisma.orders.findMany({
            where: {
                pharmacyID: pharmacyId,
                ...(status && { status: status })
            }
        }) as Order[];
    }

    async getOrderById(orderId: number, userPharmacyId: number): Promise<Order | null> {
        // Validate OrderID is present and a positive integer
        if (isNaN(orderId) || orderId <= 0) {
            throw createError(400, 'Invalid order ID');
        }

        // Validate Order Exists & Grab Order Details
        const order = await this.prisma.orders.findUnique({
            where: { orderID: orderId }
        }) as Order | null;

        if (!order) {
            throw createError(404, `Order ${orderId} not found`);
        }

        // Permission check
        if (order.pharmacyID !== userPharmacyId) {
            throw createError(403, 'Forbidden: You do not have access to this order');
        }

        return order;
    }

    async assignDrone(orderId: number, droneId: number): Promise<Order> {
        // Validate OrderID and DroneID are present and positive integers
        if (isNaN(orderId) || orderId <= 0) {
            throw createError(400, 'Invalid order ID');
        }
        if (isNaN(droneId) || droneId <= 0) {
            throw createError(400, 'Invalid drone ID');
        }

        // Validate Order Exists & is pending
        const order = await this.prisma.orders.findUnique({
            where: ({ orderID: orderId })
        })
        if (!order) {
            throw createError(404, `Order ${orderId} not found`);
        }
        if (order.status !== OrderStatus.PENDING) {
            throw createError(400, `Order is already ${order.status}`);
        }

        // Validate Drone Exists & is available
        const drone = await this.prisma.drones.findUnique({
            where: { droneID: droneId }
        });
        if (!drone) {
            throw createError(404, `Drone ${droneId} not found`);
        }
        if (drone.currentStatus !== 'IDLE') {
            throw createError(400, `Drone ${droneId} is currently ${drone.currentStatus}`);
        }

        // Update drone status to IN_TRANSIT
        await this.prisma.drones.update({
            where: { droneID: droneId },
            data: { currentStatus: 'IN_TRANSIT' }
        });

        // Assign drone and update order status to IN_TRANSIT
        return await this.prisma.orders.update({
            where: { orderID: orderId },
            data: { 
                droneID: droneId,
                status: OrderStatus.IN_TRANSIT 
            }
        }) as Order;
    }
}
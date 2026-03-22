import { PrismaClient, Orders as PrismaOrder } from '@prisma/client';
import { PharmacyService } from './pharmacy.service';
import { Order } from '@shared/order.model';
import { OrderStatus } from '@shared/order.model';

export class PrismaPharmacyService implements PharmacyService {
    private prisma = new PrismaClient();

    async ingestOrder(pharmacyID: number, orderData: any): Promise<Order> {
        try {
            return await this.prisma.orders.create({
                data: {
                    pharmacyID: pharmacyID,
                    customerFirstName: orderData.firstName,
                    customerLastName: orderData.lastName,
                    address: orderData.address,
                    city: orderData.city,
                    state: orderData.state,
                    zip: orderData.zip,
                    medicationName: orderData.medication,
                    status: OrderStatus.PENDING,
                }
            });
        } catch (error) {
            console.error("Order creation failed:", error);
            throw new Error("Failed to add order to database");
        }
    }
}
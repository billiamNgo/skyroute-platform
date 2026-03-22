import { PrismaClient, Orders as PrismaOrder } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PharmacyService } from './pharmacy.service';
import { Order } from '@shared/order.model';
import { OrderStatus } from '@shared/order.model';

export class PrismaPharmacyService implements PharmacyService {
    private prisma: PrismaClient;

    constructor() {
        console.log('Database url:', process.env.DATABASE_URL);

        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }

    async ingestOrder(pharmacyID: number, orderData: any): Promise<Order> {
        try {
            return await this.prisma.orders.create({
                data: {
                    pharmacyID,
                    customerFirstName: orderData.customerFirstName,
                    customerLastName: orderData.customerLastName,
                    address: orderData.address,
                    city: orderData.city,
                    state: orderData.state,
                    zip: Number(orderData.zip),
                    medicationName: orderData.medicationName,
                    status: OrderStatus.PENDING,
                }
            });
        } catch (error) {
            console.error("Order creation failed:", error);
            throw new Error("Failed to add order to database");
        }
    }
}
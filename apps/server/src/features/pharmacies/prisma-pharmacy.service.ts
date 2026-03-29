import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PharmacyService } from './pharmacy.service';
import { Order } from '@shared/order.model';
import { OrderStatus } from '@shared/order.model';
import createError from 'http-errors';

export class PrismaPharmacyService implements PharmacyService {
    private prisma: PrismaClient;

    constructor() {
        console.log('Database url:', process.env.DATABASE_URL);

        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }

    async ingestOrder(pharmacyID: number, orderData: any): Promise<Order> {
        // Validate PharmacyID is present and a positive integer
        if (isNaN(pharmacyID) || pharmacyID <= 0) {
            throw createError(400, 'Invalid pharmacy ID');
        }
        
        // Validate required fields
        const requiredFields = ['customerFirstName', 'customerLastName', 'address', 'city', 'state', 'zip', 'medicationName'];
        for (const field of requiredFields) {
            if (!orderData[field]) {
                throw createError(400, `Missing required field: ${field}`);
            }
        }

        // Validate zip code
        if (isNaN(orderData.zip) || orderData.zip <= 0) {
            throw createError(400, 'Invalid zip code');
        }
        
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
            }) as Order;
        } catch (error) {
            // Check for foreign key constraint violation (Pharmacy ID does not exist)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw createError(400, "Pharmacy ID does not exist");
            }

            // Log and rethrow other errors as 500
            console.error("Order creation failed:", error);
            throw createError(500, "Failed to add order to database");
        }
    }
}
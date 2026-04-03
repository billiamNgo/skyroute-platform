import { PrismaOrderService } from './prisma-order.service';
import { PrismaClient } from '@prisma/client';
import { OrderStatus } from '@shared/order.model';

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        pharmacies: { findUnique: jest.fn() },
        orders: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
        drones: { findUnique: jest.fn(), update: jest.fn() },
    })),
    adapter: { PrismaPg: jest.fn() }
}));

jest.mock('@prisma/adapter-pg', () => ({
    PrismaPg: jest.fn()
}));

describe('PrismaOrderService', () => {
    let service: PrismaOrderService;
    let prismaMock: any;

    beforeEach(() => {
        service = new PrismaOrderService();
        prismaMock = (service as any).prisma;
    });

    describe('getOrdersByPharmacy', () => {
        it('should throw 400 if pharmacyId is invalid', async () => {
            await expect(service.getOrdersByPharmacy(0))
                .rejects.toMatchObject({ status: 400, message: 'Invalid pharmacy ID' });
        });

        it('should throw 404 if pharmacy does not exist', async () => {
            prismaMock.pharmacies.findUnique.mockResolvedValue(null);
            await expect(service.getOrdersByPharmacy(1))
                .rejects.toMatchObject({ status: 404, message: 'Pharmacy not found' });
        });

        it('should return orders if pharmacy exists', async () => {
            prismaMock.pharmacies.findUnique.mockResolvedValue({ pharmacyID: 1 });
            prismaMock.orders.findMany.mockResolvedValue([{ orderID: 101 }]);
            
            const result = await service.getOrdersByPharmacy(1);
            expect(result).toHaveLength(1);
            expect(prismaMock.orders.findMany).toHaveBeenCalled();
        });
    });

    describe('assignDrone', () => {
        it('should throw error if drone is not IDLE', async () => {
            prismaMock.orders.findUnique.mockResolvedValue({ orderID: 1, status: OrderStatus.PENDING });
            prismaMock.drones.findUnique.mockResolvedValue({ droneID: 2, currentStatus: 'BUSY' });

            await expect(service.assignDrone(1, 2))
                .rejects.toMatchObject({ status: 400, message: /is currently BUSY/ });
        });

        it('should update both drone and order status on success', async () => {
            prismaMock.orders.findUnique.mockResolvedValue({ orderID: 1, status: OrderStatus.PENDING });
            prismaMock.drones.findUnique.mockResolvedValue({ droneID: 2, currentStatus: 'IDLE' });
            
            await service.assignDrone(1, 2);

            expect(prismaMock.drones.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { currentStatus: 'IN_TRANSIT' }
            }));
            expect(prismaMock.orders.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { droneID: 2, status: OrderStatus.IN_TRANSIT }
            }));
        });
    });
});
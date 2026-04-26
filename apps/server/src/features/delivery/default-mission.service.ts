import { MissionService } from './mission.service';
import { OrderService } from '../orders/order.service';
import { SocketService } from '../realtime/socket.service';
import { GeocodingService } from '../../services/geocoding/geocoding.service';
import { DroneDelivery } from '@shared/delivery.model';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export class DefaultMissionService implements MissionService {
    private prisma: PrismaClient;

    constructor(
        private orderService: OrderService,
        private socketService: SocketService,
        private geocodingService: GeocodingService
    ) {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }

    async assignMission(orderId: number, droneId: number, pharmacyId: number): Promise<void> {
        console.log(`Orchestrating mission for Order ${orderId} with Drone ${droneId}`);

        // 1. Assign drone in database via OrderService
        const updatedOrder = await this.orderService.assignDrone(orderId, droneId, pharmacyId);

        // 2. Fetch pharmacy coordinates (Origin) directly via Prisma to keep services clean
        const pharmacy = await this.prisma.pharmacies.findUnique({
            where: { pharmacyID: pharmacyId }
        });

        if (!pharmacy || !pharmacy.latitude || !pharmacy.longitude) {
            throw new Error('Pharmacy location data incomplete or pharmacy not found');
        }

        // 3. Resolve order coordinates (Destination)
        const coords = await this.geocodingService.geocode(
            updatedOrder.address, 
            updatedOrder.city, 
            updatedOrder.state
        );

        // 4. Construct clean Delivery DTO
        const delivery: DroneDelivery = {
            orderId: updatedOrder.orderID,
            droneId,
            pharmacyId,
            originLat: pharmacy.latitude,
            originLon: pharmacy.longitude,
            destinationLat: coords.latitude,
            destinationLon: coords.longitude
        };

        // 5. Broadcast the mission via Socket.io
        this.socketService.broadcastOrderAssignment(delivery);
    }
}

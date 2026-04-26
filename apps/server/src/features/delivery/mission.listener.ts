import { eventBus } from '../../events/event-bus';
import { GeocodingWrapper } from './geocoding.wrapper';
import { SocketService } from '../realtime/socket.service';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DroneDelivery } from '@shared/delivery.model';

export class MissionListener {
    private prisma: PrismaClient;
    private geocoding: GeocodingWrapper;

    constructor(private socketService: SocketService) {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
        this.geocoding = new GeocodingWrapper();

        // Subscribe to the domain event
        eventBus.on('mission:pending', this.handleMissionPending.bind(this));
        console.log('[MissionListener] Subscribed to mission:pending events.');
    }

    private async handleMissionPending(payload: { orderId: number, droneId: number, pharmacyId: number }) {
        const { orderId, droneId, pharmacyId } = payload;
        console.log(`[MissionListener] Processing pending mission for Order ${orderId}...`);

        try {
            // 1. Fetch necessary data
            const order = await this.prisma.orders.findUnique({ where: { orderID: orderId } });
            const pharmacy = await this.prisma.pharmacies.findUnique({ where: { pharmacyID: pharmacyId } });

            if (!order || !pharmacy) {
                console.error(`[MissionListener] Invalid payload data. Order or Pharmacy not found.`);
                return;
            }

            // 2. Geocode Addresses (in parallel for efficiency)
            const [originCoords, destCoords] = await Promise.all([
                this.geocoding.geocode(pharmacy.address, pharmacy.city, pharmacy.state),
                this.geocoding.geocode(order.address, order.city, order.state)
            ]);

            // 3. Construct Payload
            const delivery: DroneDelivery = {
                orderId,
                droneId,
                pharmacyId,
                originLat: originCoords.latitude,
                originLon: originCoords.longitude,
                destinationLat: destCoords.latitude,
                destinationLon: destCoords.longitude
            };

            // 4. Broadcast via Sockets
            this.socketService.broadcastOrderAssignment(delivery);
            console.log(`[MissionListener] Successfully dispatched mission geodata to Drone ${droneId}`);
            
            // Note: The Drone simulator is responsible for changing its status to IN_TRANSIT 
            // once it receives this payload and actually begins the flight.
        } catch (error) {
            console.error(`[MissionListener] Failed to process mission ${orderId}:`, error);
        }
    }
}

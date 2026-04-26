import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import http from 'http';
import TokenService from '../token/token.service';
import { OrderStatus } from '@shared/order.model';
import { DroneDelivery } from '@shared/delivery.model';

export class SocketService {
    private io: Server;
    private prisma: PrismaClient;

    constructor(server: http.Server, private tokenService: TokenService) {
        this.io = new Server(server, {
            cors: {
                origin: '*', // Adjust as needed for production
                methods: ['GET', 'POST']
            }
        });
        
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });

        this.setupMiddleware();
        this.setupListeners();
    }

    private setupMiddleware() {
        this.io.use(async (socket: Socket, next) => {
            const token = socket.handshake.auth?.token;

            if (!token) {
                console.error(`Socket ${socket.id} rejected: No token provided`);
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = await this.tokenService.verifyToken(token);
            if (!decoded || !decoded.user) {
                console.error(`Socket ${socket.id} rejected: Invalid token`);
                return next(new Error('Authentication error: Invalid token'));
            }

            // Verify user has correct role (drone, pharmacy, or admin)
            const role = decoded.user.role;
            if (role !== 'drone' && role !== 'pharmacy' && role !== 'admin' && role !== 'technician') {
                console.error(`Socket ${socket.id} rejected: Insufficient permissions (${role})`);
                return next(new Error('Authentication error: Insufficient permissions'));
            }

            // Attach user data to the socket for use in event listeners
            (socket as any).user = decoded.user;
            console.log(`Socket ${socket.id} authenticated as ${decoded.user.email} (Pharmacy: ${decoded.user.pharmacyId})`);
            next();
        });
    }

    private setupListeners() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Room logic based on PharmacyID
            socket.on('join:pharmacy', (pharmacyId: number) => {
                const authenticatedPharmacyId = (socket as any).user.pharmacyId;
                
                if (authenticatedPharmacyId && authenticatedPharmacyId !== pharmacyId) {
                    console.error(`Socket ${socket.id} attempted to join unauthorized room: pharmacy_${pharmacyId}`);
                    return; // Fail silently or emit error
                }

                const roomName = `pharmacy_${pharmacyId}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined room: ${roomName}`);
            });

            // Handle Drone Telemetry
            socket.on('drone:telemetry', async (data: { droneId: number; latitude: number; longitude: number; pharmacyId: number; batteryLevel?: number }) => {
                const { droneId, latitude, longitude, pharmacyId, batteryLevel } = data;
                const authenticatedPharmacyId = (socket as any).user.pharmacyId;

                if (authenticatedPharmacyId && authenticatedPharmacyId !== pharmacyId) {
                    console.error(`Socket ${socket.id} attempted to send telemetry for unauthorized pharmacy: ${pharmacyId}`);
                    return;
                }
                
                try {
                    // 1. Persistence Layer: Save to database
                    await this.prisma.droneLocation.create({
                        data: {
                            droneID: droneId,
                            latitude,
                            longitude,
                        }
                    });

                    // Update Drone's battery level if provided
                    if (batteryLevel !== undefined) {
                        await this.prisma.drones.update({
                            where: { droneID: droneId },
                            data: { batteryLevel }
                        });
                    }

                    // 2. Broadcast to UI clients in the same pharmacy room
                    this.io.to(`pharmacy_${pharmacyId}`).emit('drone:locationUpdate', {
                        droneId,
                        latitude,
                        longitude,
                        batteryLevel,
                        timestamp: new Date()
                    });

                } catch (error) {
                    console.error(`Error saving telemetry for drone ${droneId}:`, error);
                }
            });

            // Handle Drone Status Updates (from simulator when finished)
            socket.on('drone:statusUpdate', async (data: { droneId: number; status: string; orderId?: number }) => {
                const { droneId, status, orderId } = data;
                const authenticatedPharmacyId = (socket as any).user.pharmacyId;

                try {
                    // Verify drone belongs to the pharmacy
                    if (authenticatedPharmacyId) {
                        const drone = await this.prisma.drones.findUnique({ where: { droneID: droneId } });
                        if (!drone || drone.pharmacyID !== authenticatedPharmacyId) {
                            console.error(`Socket ${socket.id} attempted to update status for unauthorized drone: ${droneId}`);
                            return;
                        }
                    }

                    // Handle routing of status updates based on the target entity
                    if (status === 'DELIVERED' && orderId) {
                        // Update Order to DELIVERED
                        await this.prisma.orders.update({
                            where: { orderID: orderId },
                            data: { status: OrderStatus.DELIVERED }
                        });
                        console.log(`Order ${orderId} marked as DELIVERED by drone ${droneId}`);
                    } else {
                        // Update Drone status (IDLE, IN_TRANSIT, PENDING, etc.)
                        await this.prisma.drones.update({
                            where: { droneID: droneId },
                            data: { currentStatus: status }
                        });
                        console.log(`Drone ${droneId} status updated to ${status}`);
                    }
                } catch (error) {
                    console.error(`Error updating status for drone ${droneId}:`, error);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });
    }

    public broadcastOrderAssignment(delivery: DroneDelivery) {
        const roomName = `pharmacy_${delivery.pharmacyId}`;
        this.io.to(roomName).emit('order:assigned', delivery);
        console.log(`Broadcasted order ${delivery.orderId} assigned to drone ${delivery.droneId} in room ${roomName}`);
    }
}

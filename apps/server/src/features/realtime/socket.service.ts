import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import http from 'http';

export class SocketService {
    private io: Server;
    private prisma: PrismaClient;

    constructor(server: http.Server) {
        this.io = new Server(server, {
            cors: {
                origin: '*', // Adjust as needed for production
                methods: ['GET', 'POST']
            }
        });
        
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });

        this.setupListeners();
    }

    private setupListeners() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Room logic based on PharmacyID
            socket.on('join:pharmacy', (pharmacyId: number) => {
                const roomName = `pharmacy_${pharmacyId}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined room: ${roomName}`);
            });

            // Handle Drone Telemetry
            socket.on('drone:telemetry', async (data: { droneId: number; latitude: number; longitude: number; pharmacyId: number }) => {
                const { droneId, latitude, longitude, pharmacyId } = data;
                
                try {
                    // 1. Persistence Layer: Save to database
                    await this.prisma.droneLocation.create({
                        data: {
                            droneID: droneId,
                            latitude,
                            longitude,
                        }
                    });

                    // 2. Broadcast to UI clients in the same pharmacy room
                    this.io.to(`pharmacy_${pharmacyId}`).emit('drone:locationUpdate', {
                        droneId,
                        latitude,
                        longitude,
                        timestamp: new Date()
                    });

                } catch (error) {
                    console.error(`Error saving telemetry for drone ${droneId}:`, error);
                }
            });

            // Handle Drone Status Updates (from simulator when finished)
            socket.on('drone:statusUpdate', async (data: { droneId: number; status: string }) => {
                const { droneId, status } = data;
                try {
                    await this.prisma.drones.update({
                        where: { droneID: droneId },
                        data: { currentStatus: status }
                    });
                    console.log(`Drone ${droneId} status updated to ${status}`);
                } catch (error) {
                    console.error(`Error updating status for drone ${droneId}:`, error);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });
    }

    public broadcastOrderAssignment(pharmacyId: number, orderId: number, droneId: number) {
        const roomName = `pharmacy_${pharmacyId}`;
        this.io.to(roomName).emit('order:assigned', {
            orderId,
            droneId,
            pharmacyId
        });
        console.log(`Broadcasted order ${orderId} assigned to drone ${droneId} in room ${roomName}`);
    }
}

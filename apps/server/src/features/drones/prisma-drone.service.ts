import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Drone, DroneLocation } from "@shared/drone.model";
import { DroneService } from "./drone.service";
import createError from 'http-errors';

export class PrismaDroneService implements DroneService {
    private prisma: PrismaClient;

    constructor() {
        console.log('Database url:', process.env.DATABASE_URL);
        
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
    }

    async getDronesByPharmacy(pharmacyId: number): Promise<Drone[]> {
        return await this.prisma.drones.findMany({
            where: { pharmacyID: pharmacyId }
        }) as Drone[];
    }

    async getDroneTrackingData(droneId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null }> {
        const drone = await this.prisma.drones.findUnique({
            where: { droneID: droneId },
            include: {
                locations: {
                    orderBy: { reportedAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!drone) {
            throw createError(404, `Drone ${droneId} not found`);
        } 
        
        const { locations, ...droneData } = drone;
        return {
            drone: droneData as Drone,
            lastLocation: locations[0] as DroneLocation || null
        };
    }

    async updateDroneStatus(droneId: number, status: string): Promise<Drone> {
        const drone = await this.prisma.drones.findUnique({ where: { droneID: droneId } });
        if (!drone) {
            throw createError(404, `Drone ${droneId} not found`);
        }

        return await this.prisma.drones.update({
            where: { droneID: droneId },
            data: { currentStatus: status }
        }) as unknown as Drone;
    }
}
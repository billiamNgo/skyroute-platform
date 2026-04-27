import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Drone, DroneLocation } from "@shared/drone.model";
import { DroneService } from "./drone.service";
import createError from 'http-errors';
import { GeocodingWrapper } from "../delivery/geocoding.wrapper";

export class PrismaDroneService implements DroneService {
    private prisma: PrismaClient;
    private geocoding: GeocodingWrapper;

    constructor() {
        console.log('Database url:', process.env.DATABASE_URL);
        
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter });
        this.geocoding = new GeocodingWrapper();
    }

    async getDronesByPharmacy(pharmacyId: number): Promise<Drone[]> {
        return await this.prisma.drones.findMany({
            where: { pharmacyID: pharmacyId }
        }) as Drone[];
    }

    async getDroneTrackingData(droneId: number, pharmacyId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null; destinationLat?: number; destinationLon?: number }> {
        // 1. Get the drone
        const drone = await this.prisma.drones.findUnique({
            where: { droneID: droneId }
        });

        if (!drone || drone.pharmacyID !== pharmacyId) {
            throw createError(404, 'Drone not found');
        }

        // 2. Get the last location
        const lastLocation = await this.prisma.droneLocation.findFirst({
            where: { droneID: droneId },
            orderBy: { reportedAt: 'desc' }
        });

        const result: any = {
            drone: drone as Drone,
            lastLocation: lastLocation as DroneLocation | null
        };

        // 3. If the drone is IN_TRANSIT, we might have a destination from the last order assigned to it
        if (drone.currentStatus === 'IN_TRANSIT') {
            const order = await this.prisma.orders.findFirst({
                where: { droneID: droneId, status: 'IN_TRANSIT' },
                include: { pharmacy: true }
            });

            if (order) {
                // We'll geocode the destination on the fly for the MVP
                // In a production app, we should store lat/lon on the order record
                const coords = await this.geocoding.geocode(order.address, order.city, order.state);
                result.destinationLat = coords.latitude;
                result.destinationLon = coords.longitude;
            }
        }

        return result;
    }

    async getFleetTrackingData(pharmacyId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null, pharmacyLocation: { latitude: number, longitude: number } }[]> {
        const drones = await this.prisma.drones.findMany({
            where: { pharmacyID: pharmacyId },
            include: {
                locations: {
                    orderBy: { reportedAt: 'desc' },
                    take: 1
                },
                pharmacy: true
            }
        });

        if (drones.length === 0) return [];

        // Geocode the pharmacy address for this fleet
        const pharmacy = drones[0].pharmacy;
        const pCoords = await this.geocoding.geocode(pharmacy.address, pharmacy.city, pharmacy.state);

        return drones.map(d => {
            const { locations, pharmacy, ...droneData } = d;
            return {
                drone: droneData as unknown as Drone,
                lastLocation: (locations[0] as unknown as DroneLocation) || null,
                pharmacyLocation: pCoords
            };
        });
    }

    async getDroneById(droneId: number): Promise<Drone | null> {
        const drone = await this.prisma.drones.findUnique({
            where: { droneID: droneId }
        });
        return drone as Drone | null;
    }

    async updateDroneStatus(droneId: number, status: string): Promise<Drone> {
        const drone = await this.prisma.drones.findUnique({ where: { droneID: droneId } });
        if (!drone) {
            throw createError(404, 'Drone not found');
        }

        const updated = await this.prisma.drones.update({
            where: { droneID: droneId },
            data: { currentStatus: status }
        });

        return updated as Drone;
    }
}
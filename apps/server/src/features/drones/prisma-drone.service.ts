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
        // Check drone belongs to pharmacy if pharmacyId provided
        if (pharmacyId !== undefined && drone.pharmacyID !== pharmacyId) {
            throw createError(403, 'Forbidden: Drone does not belong to your pharmacy');
        }

        const { locations, ...droneData } = drone;
        const result: any = {
            drone: droneData as Drone,
            lastLocation: locations[0] as DroneLocation || null
        };

        // If drone has an active order, fetch and geocode the destination
        if (drone.currentStatus === 'IN_TRANSIT' && drone.droneID) {
            const activeOrder = await this.prisma.orders.findFirst({
                where: {
                    droneID: droneId,
                    status: 'IN_TRANSIT'
                }
            });

            if (activeOrder) {
                try {
                    const destCoords = await this.geocoding.geocode(
                        activeOrder.address,
                        activeOrder.city,
                        activeOrder.state
                    );
                    result.destinationLat = destCoords.latitude;
                    result.destinationLon = destCoords.longitude;
                } catch (err) {
                    console.warn(`[DroneService] Could not geocode destination for order ${activeOrder.orderID}:`, err);
                }
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
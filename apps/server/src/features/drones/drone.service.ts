import { Drone, DroneLocation } from '@shared/drone.model';

export interface DroneService {
    getDroneById(droneId: number): Promise<Drone | null>;
    getDronesByPharmacy(pharmacyId: number): Promise<Drone[]>;
    getDroneTrackingData(droneId: number, pharmacyId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null; destinationLat?: number; destinationLon?: number }>;
    getFleetTrackingData(pharmacyId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null, pharmacyLocation: { latitude: number, longitude: number } }[]>;
    updateDroneStatus(droneId: number, status: string): Promise<Drone>;
}
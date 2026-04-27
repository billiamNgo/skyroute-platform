import { Drone, DroneLocation } from '@shared/drone.model';

export interface DroneService {
    getDronesByPharmacy(pharmacyId: number): Promise<Drone[]>;
    getDroneTrackingData(droneId: number, pharmacyId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null; destinationLat?: number; destinationLon?: number }>;
    getFleetTrackingData(pharmacyId: number): Promise<{ drone: Drone; lastLocation: DroneLocation | null }[]>;
    updateDroneStatus(droneId: number, status: string): Promise<Drone>;
}
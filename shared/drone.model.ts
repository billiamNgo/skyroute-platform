export interface Drone {
    droneID: number;
    pharmacyID: number;
    currentStatus: string;
    batteryLevel: number;
}

export enum DroneStatus {
    IDLE = "IDLE",
    IN_TRANSIT = "IN_TRANSIT",
    CHARGING = "CHARGING",
    MAINTENANCE = "MAINTENANCE"
}

// Used to get/save drone location data
export interface DroneLocation {
    droneID: number;
    latitude: number;
    longitude: number;
    reportedAt?: Date;
}
export interface Order {
    orderID: number;
    pharmacyID: number;
    droneID?: number | null;
    customerFirstName: string;
    customerLastName: string;
    address: string;
    city: string;
    state: string;
    zip: number;
    latitude?: number;
    longitude?: number;
    status?: string;
    medicationName: string;
    pharmacy?: any; // Nested pharmacy object to prevent double calls to db
}

export enum OrderStatus {
    PENDING = "PENDING",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
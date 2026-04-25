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
    status?: string;
    medicationName: string;
}

export enum OrderStatus {
    PENDING = "PENDING",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export interface Order {
    orderID: number;
    droneID?: number | null;
    pharmacyID: number;
    customerLastName: string;
    customerFirstName: string;
    address: string;
    city: string;
    state: string;
    zip: number;
    status: OrderStatus;
    medicationName: string;
}

export type OrderStatus = 'pending' | 'in-progress' | 'delivered' | 'cancelled';
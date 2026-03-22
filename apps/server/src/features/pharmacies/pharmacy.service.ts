import { Order } from '@shared/order.model';

export interface PharmacyService {
    ingestOrder(pharamcyID: number, orderData: any): Promise<Order>;
}
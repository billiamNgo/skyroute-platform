import { Order, OrderStatus } from '@shared/order.model';

export interface OrderService {
    getOrdersByPharmacy(pharmacyId: number, status?: OrderStatus): Promise<Order[]>;
    getOrderById(orderId: number): Promise<Order | null>;
    assignDrone(orderId: number, droneId: number): Promise<Order>;
}
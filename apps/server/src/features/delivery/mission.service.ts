import { DroneDelivery } from '@shared/delivery.model';

export interface MissionService {
    assignMission(orderId: number, droneId: number, pharmacyId: number): Promise<void>;
}

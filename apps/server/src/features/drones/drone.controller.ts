import { Request, Response } from 'express';
import { DroneService } from './drone.service';

export class DroneController {
    constructor(private droneService: DroneService) {}

    getAllDrones = async (req: Request, res: Response) => {
        try {
            const pharmacyId = Number(req.user.pharmacyId);
            const drones = await this.droneService.getDronesByPharmacy(pharmacyId);
            return res.json(drones);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };

    trackDrone = async (req: Request, res: Response) => {
        try {
            const droneId = Number(req.params.id);
            const pharmacyId = Number((req as any).user.pharmacyId);
            const tracking = await this.droneService.getDroneTrackingData(droneId, pharmacyId);
            return res.json(tracking);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };

    updateStatus = async (req: Request, res: Response) => {
        try {
            const droneId = Number(req.params.id);
            const { status } = req.body;
            const updated = await this.droneService.updateDroneStatus(droneId, status);
            return res.json(updated);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    };
}
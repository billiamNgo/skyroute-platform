import { Request, Response } from 'express';
import { PharmacyService } from './pharmacy.service';

export class PharmacyController {
    constructor(private pharmacyService: PharmacyService) {}

    ingestOrder = async (req: Request, res: Response) => {
        try {
            const pharmacyID = Number(req.params.pharmacyID);
            const orderData = req.body;
            const newOrder = await this.pharmacyService.ingestOrder(pharmacyID, orderData);
            return res.status(201).json(newOrder);
        } catch (error: any) {
            return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
        }
    }
}
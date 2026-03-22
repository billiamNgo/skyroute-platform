import { Request, Response } from 'express';
import { PharmacyService } from './pharmacy.service';

export class PharmacyController {
    constructor(private pharmacyService: PharmacyService) {}

    ingestOrder = async (req: Request, res: Response) => {
        try {
            const { pharmacyID, orderData } = req.body;
            if (!pharmacyID) {
                return res.status(400).json({ message: 'Missing pharmacy identifier' });
            }

            const newOrder = this.pharmacyService.ingestOrder(pharmacyID, orderData);
            return res.status(201).json(newOrder);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
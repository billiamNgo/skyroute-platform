import { Router } from 'express';
import { PharmacyController } from './pharmacy.controller';
import { PrismaPharmacyService } from './prisma-pharmacy.service';

const router = Router();

// Dependency injection for PharmacyService into PharmacyController
const pharmacyService = new PrismaPharmacyService();
const pharmacyController = new PharmacyController(pharmacyService);

router.post('/new-order', pharmacyController.ingestOrder);

export default router;
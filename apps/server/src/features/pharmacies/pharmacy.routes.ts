import { Router } from 'express';
import { PharmacyController } from './pharmacy.controller';
import { PrismaPharmacyService } from './prisma-pharmacy.service';

// Export a factory so the caller can inject the security middleware instance
export default function pharmacyRoutes(security: any) {
	const router = Router();

	// Dependency injection for PharmacyService into PharmacyController
	const pharmacyService = new PrismaPharmacyService();
	const pharmacyController = new PharmacyController(pharmacyService);

	// Require JWT authentication and pharmacy role for creating new orders
	router.post(
		'/:pharmacyID/new-order',
		security.authenticateJWT,
        security.isPharmacy,
		pharmacyController.ingestOrder
	);

	return router;
}
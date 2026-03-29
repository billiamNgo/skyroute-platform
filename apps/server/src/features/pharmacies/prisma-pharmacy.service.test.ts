import createError from 'http-errors';
import { PrismaPharmacyService } from './prisma-pharmacy.service';

describe('PrismaPharmacyService', () => {
  let service: PrismaPharmacyService;

  beforeEach(() => {
    service = new PrismaPharmacyService();
    // replace prisma with a mock to avoid real DB calls
    (service as any).prisma = {
      orders: {
        create: jest.fn()
      }
    };
  });

  it('creates and returns an order when input is valid', async () => {
    const created = { id: 10, customerFirstName: 'Jane' };
    (service as any).prisma.orders.create.mockResolvedValue(created);

    const res = await service.ingestOrder(1, {
      customerFirstName: 'Jane',
      customerLastName: 'Doe',
      address: '1 Main',
      city: 'City',
      state: 'ST',
      zip: 12345,
      medicationName: 'Med'
    });

    expect(res).toEqual(created);
  });

  it('throws 400 for invalid pharmacyID', async () => {
    await expect(service.ingestOrder(0, {})).rejects.toHaveProperty('status', 400);
  });

  it('throws 400 for missing required fields', async () => {
    await expect(service.ingestOrder(1, { customerLastName: 'Doe' })).rejects.toHaveProperty('status', 400);
  });

  it('throws 400 for invalid zip', async () => {
    await expect(service.ingestOrder(1, {
      customerFirstName: 'Jane',
      customerLastName: 'Doe',
      address: '1 Main',
      city: 'City',
      state: 'ST',
      zip: 'abc',
      medicationName: 'Med'
    })).rejects.toHaveProperty('status', 400);
  });

  it('converts DB errors to 500', async () => {
    (service as any).prisma.orders.create.mockRejectedValue(new Error('DB down'));
    await expect(service.ingestOrder(1, {
      customerFirstName: 'Jane',
      customerLastName: 'Doe',
      address: '1 Main',
      city: 'City',
      state: 'ST',
      zip: 12345,
      medicationName: 'Med'
    })).rejects.toHaveProperty('status', 500);
  });
});

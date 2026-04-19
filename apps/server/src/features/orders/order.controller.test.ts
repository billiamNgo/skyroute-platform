import { OrderController } from './order.controller';
import { Request, Response } from 'express';
import { OrderService } from './order.service';

describe('OrderController', () => {
    let controller: OrderController;
    let mockService: jest.Mocked<OrderService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        mockService = {
            getOrdersByPharmacy: jest.fn(),
            getOrderById: jest.fn(),
            assignDrone: jest.fn(),
        } as any;

        const mockSocketService = {
            broadcastOrderAssignment: jest.fn(),
        } as any;

        controller = new OrderController(mockService, mockSocketService);
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = { json: jsonMock, status: statusMock };
    });

    describe('getAllOrders', () => {
        it('should return orders successfully', async () => {
            req = { 
                user: { pharmacyId: 1 }, 
                query: { status: 'PENDING' } 
            } as any;
            const mockOrders = [{ orderID: 123 }];
            mockService.getOrdersByPharmacy.mockResolvedValue(mockOrders as any);

            await controller.getAllOrders(req as Request, res as Response);

            expect(mockService.getOrdersByPharmacy).toHaveBeenCalledWith(1, 'PENDING');
            expect(jsonMock).toHaveBeenCalledWith(mockOrders);
        });

        it('should handle errors and return status 500 by default', async () => {
            req = { user: { pharmacyId: 1 }, query: {} } as any;
            mockService.getOrdersByPharmacy.mockRejectedValue(new Error('DB Error'));

            await controller.getAllOrders(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'DB Error' });
        });
    });

    describe('assignOrder', () => {
        it('should call assignDrone with correct params', async () => {
            req = { 
                params: { id: '10' }, 
                body: { droneId: 5 },
                user: { pharmacyId: 1 }
            } as any;
            await controller.assignOrder(req as Request, res as Response);
            
            expect(mockService.assignDrone).toHaveBeenCalledWith(10, 5, 1);
        });
    });
});
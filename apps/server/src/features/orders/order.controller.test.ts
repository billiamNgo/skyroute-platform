import { OrderController } from './order.controller';
import { Request, Response } from 'express';
import { OrderService } from './order.service';

describe('OrderController', () => {
    let controller: OrderController;
    let mockService: jest.Mocked<OrderService>;
    let mockMissionService: any;
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

        mockMissionService = {
            assignMission: jest.fn(),
        };

        controller = new OrderController(
            mockService, 
            mockMissionService
        );
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
    });

    describe('assignOrder', () => {
        it('should call assignMission with correct params', async () => {
            req = { 
                params: { id: '10' }, 
                body: { droneId: 5 },
                user: { pharmacyId: 1 }
            } as any;
            
            // Mock getOrderById as it's used for feedback response
            mockService.getOrderById.mockResolvedValue({ orderID: 10 } as any);

            await controller.assignOrder(req as Request, res as Response);
            
            expect(mockMissionService.assignMission).toHaveBeenCalledWith(10, 5, 1);
        });
    });
});
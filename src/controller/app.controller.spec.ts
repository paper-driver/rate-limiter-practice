import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../service/app.service';
import { StatusEnum } from '../model/app.model';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  const mockRequest = {
    socket: {
      remoteAddress: 1
    }
  } as any as Request;

  const appServiceMock = {
    getPermission: jest.fn(),
    getRouteStatus: jest.fn()
  } as any as AppService;

  beforeEach(async () => {
    appController = new AppController(appServiceMock);
  });

  describe('root', () => {

    afterEach(() => {
      jest.clearAllMocks();
    })

    it('should return response for /access', async () => {
      const mockResponse = {
        status: StatusEnum.accepted,
        availableTokens: 9
      };
      (appServiceMock.getPermission as jest.Mock).mockReturnValue(mockResponse);

      const response = await appController.getPermission('GET mock/api', mockRequest);

      expect(response).toEqual(mockResponse)
    });

    it('should return response for /status', async () => {
      const mockResponse = {
        name: 'GET mock/api',
        burst: 3,
        sustained: 60,
        availableTokens: 3,
        sustainRate: 1000
      };
      (appServiceMock.getRouteStatus as jest.Mock).mockReturnValue(mockResponse);

      const response = await appController.getStatus('GET mock/api', mockRequest);

      expect(response).toEqual(mockResponse);
    })

    const testCases = [
      ['/access', 'getPermission', 'getPermission'],
      ['/status', 'getRouteStatus', 'getStatus']
    ]

    it.each<any>(testCases)('should return exception for %p', async (route, serviceFunc, controllerFunc) => {
      (appServiceMock[serviceFunc] as jest.Mock).mockReturnValue(new BadRequestException('no such route'));

      const response = await appController[controllerFunc](route, mockRequest);
      
      expect(response.status).toEqual(400);
      expect(response.response.message).toEqual('no such route');
    })
  });
});

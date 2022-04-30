import { AppService } from "./app.service";
import { Test } from "@nestjs/testing";
import { CONFIG } from "../config/config.module";
import { CacheService } from "./cache.service";
import { Bucket, StatusEnum } from "../model/app.model";
import { BadRequestException } from "@nestjs/common";

describe('AppService', () => {
    let appService: AppService;

    const cacheServiceMock = {
        getClient: jest.fn(),
        setClient: jest.fn(),
        addBucket: jest.fn()
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AppService,
                {
                    provide: CacheService,
                    useValue: cacheServiceMock
                },
                {
                    provide: CONFIG,
                    useValue: {
                        routes: {
                            'GET mock/api': {
                                burst: 3,
                                sustained: 60
                            }
                        },
                        cache: {
                            size: 3,
                            ttl: 5
                        }
                    }
                }
            ]
        }).compile();

        appService = module.get<AppService>(AppService);
    })

    it.each<any>([
        ['existing client has visisted route before', {'GET mock/api': new Bucket('GET mock/api', 3, 60)}],
        ['existing client has not visisted route before', {}],
        ['new client', {}]
    ])('should grant permission to access GET mock/api [%p]', async (scenario, mockRes) => {
        (cacheServiceMock.getClient as jest.Mock).mockReturnValue(mockRes);
        if(!!mockRes){
            (cacheServiceMock.addBucket as jest.Mock)
                .mockReturnValue(new Bucket('GET mock/api', 3, 60))
        }

        const response = await appService.getPermission('1', 'GET mock/api');

        expect(response).toEqual({
            status: StatusEnum.accepted,
            availableTokens: 2
        })
    })

    it.each<any>([
        ['existing client has visisted route before', {'GET mock/api': new Bucket('GET mock/api', 3, 60)}],
        ['existing client has not visisted route before', {}],
        ['new client', {}]
    ])('should return status of GET mock/api [%p]', async (scenario, mockRes) => {
        (cacheServiceMock.getClient as jest.Mock).mockReturnValue(mockRes);
        if(!!mockRes){
            (cacheServiceMock.addBucket as jest.Mock)
                .mockReturnValue(new Bucket('GET mock/api', 3, 60))
        }

        const response = await appService.getRouteStatus('1', 'GET mock/api');

        expect(response).toEqual({
            name: 'GET mock/api',
            burst: 3,
            sustained: 60,
            availableTokens: 3,
            sustainRate: 1000
        })
    })

    it.each<any>([
        ['getPermission'],
        ['getRouteStatus']
    ])('should throw a exception if there is no such route [%p]', async (serviceFunc) => {
        try {
            await appService[serviceFunc]('1', 'GET invalid/api');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toEqual('no such route')
        }
    })
})
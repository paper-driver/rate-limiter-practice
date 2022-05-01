import { CacheService } from "./cache.service";
import { Test } from "@nestjs/testing";
import { CacheModule, CACHE_MANAGER, BadRequestException } from "@nestjs/common";
import { CONFIG } from "../config/config.module";
import { Cache } from "cache-manager";
import { Bucket } from "../model/app.model";

describe('CacheService', () => {
    let cacheService: CacheService;
    let cacheManager: Cache;

    const sleep = (time) => {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [CacheModule.register({ max: 3})],
            providers: [
                CacheService,
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
                            ttl: 0.5
                        }
                    }
                }
            ]
        }).compile();

        cacheService = module.get<CacheService>(CacheService);
        cacheManager = module.get<Cache>(CACHE_MANAGER);
    })

    afterEach(() => {
        jest.useRealTimers();
    })

    it.each<any>([
        ['existing client has visited some route', {'GET mock/api': new Bucket('GET mock/api', 3, 60)}],
        ['existing client has not visited any route', {}],
        ['new client', {}]
    ])('should return buckets [%p]', async (scenario, mockRes) => {
        if(!!mockRes['GET mock/api']){
            await cacheManager.set('1', mockRes);
        }

        const response = await cacheService.getClient('1');
        expect(response).toEqual(mockRes);
    })

    it('should cache client', async () => {
        const response = await cacheService.setClient('1');
        expect(response).toEqual({});
    })

    it.each<any>([
        ['existing client has visited GET mock/api', {'GET mock/api': new Bucket('GET mock/api', 3, 60)}],
        ['existing client has not visited GET mock/api', {}],
        ['new client', {}]
    ])('should add GET mock/api bucket [%p]', async (scenario, mockRes) => {
        await cacheManager.set('1', mockRes);

        const response = await cacheService.addBucket('1', 'GET mock/api');
        expect(response.getBucketInfo()).toEqual({
            name: 'GET mock/api',
            burst: 3,
            sustained: 60,
            availableTokens: 3,
            sustainRate: 1000
        });
    })

    it('should throw a exception if there is no such route', async () => {
        try {
            await cacheService.addBucket('1', 'GET invalid/api');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toEqual('no such route');
        }
    })

    it('should delete cache if it is expired and provide a new cache', async () => {
        jest.useFakeTimers();
        await cacheService.addBucket('1', 'GET mock/api');

        let client = await cacheService.getClient('1');
        expect(client['GET mock/api']).toBeDefined();

        jest.advanceTimersByTime(501)

        client = await cacheService.getClient('1');
        expect(client['GET mock/api']).toBeUndefined();
    })
})
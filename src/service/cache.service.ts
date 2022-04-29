import { Injectable, Inject, CACHE_MANAGER, BadRequestException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CONFIG } from "src/config/config.module";
import { RouteConfig, Config } from "src/config/config";
import { Bucket, CachedBuckets } from "src/model/app.model";

@Injectable()
export class CacheService {

    routes: RouteConfig;
    ttl: number;

    constructor(@Inject(CONFIG) config: Config, @Inject(CACHE_MANAGER) private cacheManager: Cache){
        this.routes = config.routes;
        this.ttl = config.cache.ttl;
    }

    async getClient(ip: string): Promise<CachedBuckets>{
        const client = await this.cacheManager.get(ip) as CachedBuckets;
        return client ? client : this.setClient(ip);
    }

    async setClient(ip: string): Promise<CachedBuckets>{
        const client = await this.cacheManager.set(ip, {}, this.ttl);
        return await this.cacheManager.get(ip);
    }

    async addBucket(ip: string, endpoint: string): Promise<Bucket> {
        const routeInfo = this.routes[endpoint]
        if(!routeInfo){
            throw new BadRequestException('no such route');
        }
        let client = await this.getClient(ip);
        if(!!client[endpoint]){
            return client[endpoint];
        }else{
            const bucket = new Bucket(endpoint, routeInfo.burst, routeInfo.sustained);
            client[endpoint] = bucket;
            await this.cacheManager.set(ip, client, this.ttl);
            return bucket;
        }
            
    }
}
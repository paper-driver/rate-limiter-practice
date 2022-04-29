import { Injectable, CacheOptionsFactory, Inject, CacheModuleOptions } from "@nestjs/common";
import { Config } from "./config";
import { CONFIG } from 'src/config/config.module';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {

    cacheSize: number;
    ttl: number;

    constructor(@Inject(CONFIG) config: Config) {
        this.cacheSize = config.cache.size;
        this.ttl = config.cache.ttl;
    }

    createCacheOptions(): Promise<CacheModuleOptions> | CacheModuleOptions {
        return {
            max: this.cacheSize,
            ttl: this.ttl
        }
    }

}
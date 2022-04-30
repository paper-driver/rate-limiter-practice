import { Injectable, CacheOptionsFactory, Inject, CacheModuleOptions } from "@nestjs/common";
import { Config } from "./config";
import { CONFIG } from '../config/config.module';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {

    cacheSize: number;

    constructor(@Inject(CONFIG) config: Config) {
        this.cacheSize = config.cache.size;
    }

    createCacheOptions(): Promise<CacheModuleOptions> | CacheModuleOptions {
        return {
            max: this.cacheSize
        }
    }

}
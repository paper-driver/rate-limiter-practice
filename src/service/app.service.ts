import { Injectable, Inject, BadRequestException, CACHE_MANAGER } from '@nestjs/common';
import { AccessDto, RouteStatus } from '../model/app.model';
import { Config, RouteConfig } from '../config/config';
import { CacheService } from './cache.service';
import { CONFIG } from '../config/config.module';

@Injectable()
export class AppService {
  routes: RouteConfig

  constructor(@Inject(CONFIG) config: Config, private cacheService: CacheService){
    this.routes = config.routes;
  }

  async getPermission(ip: string, route: string): Promise<AccessDto> {
    let client = await this.cacheService.getClient(ip);
    if(!this.routes[route]){
      throw new BadRequestException('no such route');
    }else{
      if(client[route]){
        return client[route].grantPermissionIfAvailable();
      }else{
        const bucket = await this.cacheService.addBucket(ip, route);
        return bucket.grantPermissionIfAvailable();
      }
    }
  }

  async getRouteStatus(ip: string, route: string): Promise<RouteStatus> {
    let client = await this.cacheService.getClient(ip);
    if(!this.routes[route]){
      throw new BadRequestException('no such route');
    }else{
      if(client[route]){
        return client[route].getBucketInfo();
      }else{
        const bucket = await this.cacheService.addBucket(ip, route);
        return bucket.getBucketInfo();
      }
    }
  }
}

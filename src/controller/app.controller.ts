import { Controller, Get, Req, Query } from '@nestjs/common';
import { AppService } from '../service/app.service';
import { AccessDto, RouteStatus } from '../model/app.model';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/access")
  getPermission(@Query('route') route: string, @Req() request: Request): Promise<AccessDto> {
    const ip = request.socket.remoteAddress;
    return this.appService.getPermission(ip, route)
  }
  
  @Get("/status")
  getStatus(@Query('route') route: string, @Req() request: Request): Promise<RouteStatus> {
    const ip = request.socket.remoteAddress;
    return this.appService.getRouteStatus(ip, route);
  }
}

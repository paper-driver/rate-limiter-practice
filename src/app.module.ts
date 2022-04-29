import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { ConfigModule } from './config/config.module';
import { CacheConfig } from './config/cache.config';
import { CacheService } from './service/cache.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useClass: CacheConfig
    })
  ],
  controllers: [AppController],
  providers: [AppService, CacheService],
})
export class AppModule {}

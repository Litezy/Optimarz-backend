import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { DatabaseModule } from './database/database.module';
import { CustomLoggerService } from './common/services/logger.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { BlogModule } from './blog/blog.module';
import { DownloadsModule } from './downloads/downloads.module';

@Module({
  imports: [AdminModule, ContactModule, WaitlistModule, DatabaseModule, BlogModule, DownloadsModule,DownloadsModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    AppService,
    CustomLoggerService
  ],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    DatabaseModule,AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService, ],
  exports: [AdminService],
})
export class AdminModule {}

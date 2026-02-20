import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[DatabaseModule,AuthModule
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService]
})
export class WaitlistModule {}

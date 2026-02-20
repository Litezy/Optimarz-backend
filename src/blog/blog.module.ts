import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [AuthModule],
  controllers: [BlogController],
  providers: [BlogService,CloudinaryService],
  exports: [BlogService],
})
export class BlogModule {}
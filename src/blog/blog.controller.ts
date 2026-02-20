
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role.guard';
import { SetMetadata } from '@nestjs/common';
import { SuccessMessage } from 'src/decorators/success.decorator';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @SuccessMessage('Blog created successfully')
  @Post('create')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @SetMetadata('roles', ['admin'])
  async createBlog(
    @Body(ValidationPipe) createBlogDto: CreateBlogDto,
    @Req() req: any,
  ) {
    const authorId = req.user.id;
    const file = req.files?.featuredImage;
    
    // Validate file if provided
    if (file) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size too large. Maximum size is 5MB.');
      }
    }

    return await this.blogService.createBlog(createBlogDto, authorId, file);
  }

  @SuccessMessage('Blog updated successfully')
  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @SetMetadata('roles', ['admin'])
  async updateBlog(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateBlogDto: UpdateBlogDto,
    @Req() req: any,
  ) {
    const file = req.files?.featuredImage;
    
    // Validate file if provided
    if (file) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size too large. Maximum size is 5MB.');
      }
    }

    return await this.blogService.updateBlog(id, updateBlogDto, file);
  }

  
  @SuccessMessage('Blogs fetched successfully')
  @Get('all')
  async findAllBlogs() {
    return await this.blogService.findAllBlogs();
  }

  @SuccessMessage('Blog fetched successfully')
  @Get(':id')
  async findBlogById(@Param('id', ParseIntPipe) id: number) {
    return await this.blogService.findBlogById(id);
  }

  @SuccessMessage('Blog fetched successfully')
  @Get('slug/:slug')
  async findBlogBySlug(@Param('slug') slug: string) {
    return await this.blogService.findBlogBySlug(slug);
  }

  @SuccessMessage('Blog deleted successfully')
  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @SetMetadata('roles', ['admin'])
  async deleteBlog(@Param('id', ParseIntPipe) id: number) {
    return await this.blogService.deleteBlog(id);
  }

  @SuccessMessage('Blogs fetched successfully')
  @Get('category/:category')
  async getBlogsByCategory(@Param('category') category: string) {
    return await this.blogService.getBlogsByCategory(category);
  }
}
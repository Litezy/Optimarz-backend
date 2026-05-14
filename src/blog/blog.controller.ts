
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

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file: any, fieldName: string) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(
      `${fieldName}: Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.`,
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `${fieldName}: File size too large. Maximum size is 5MB.`,
    );
  }
}

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
    const files = req.files ?? {};

    // Only featured image is supported for backward compatibility
    // All other images should be embedded inline in the content using TiptapEditor
    if (files.featuredImage) validateImageFile(files.featuredImage, 'featuredImage');

    return await this.blogService.createBlog(createBlogDto, authorId, files.featuredImage);
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
    const files = req.files ?? {};

    // Only featured image is supported for backward compatibility
    if (files.featuredImage) validateImageFile(files.featuredImage, 'featuredImage');

    return await this.blogService.updateBlog(id, updateBlogDto, files.featuredImage);
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

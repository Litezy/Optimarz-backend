import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import prisma from '../lib/prisma';

@Injectable()
export class BlogService {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    private generateImageSlug(title: string): string {
        const words = title.split(' ').slice(0, 2);
        return words
            .join('-')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .trim();
    }

    private async generateUniqueSlug(title: string): Promise<string> {
        let slug = this.generateSlug(title);
        let counter = 1;
        const originalSlug = slug;

        while (true) {
            const existingBlog = await prisma.blog.findUnique({ where: { slug } });
            if (!existingBlog) break;
            slug = `${originalSlug}-${counter}`;
            counter++;
        }

        return slug;
    }

    private async uploadFeaturedImage(file: any, namePrefix: string): Promise<string | undefined> {
        if (!file) return undefined;
        const timestamp = Date.now();
        const customFileName = `${namePrefix}-featured-${timestamp}`;
        const result = await this.cloudinaryService.uploadImageWithCustomName(file, customFileName);
        return result.secure_url;
    }

    private async deleteCloudinaryUrl(url: string | null) {
        if (!url) return;
        const publicId = this.cloudinaryService.extractPublicId(url);
        if (publicId) await this.cloudinaryService.deleteImage(publicId);
    }

    async createBlog(
        createBlogDto: CreateBlogDto,
        authorId: number,
        featuredImageFile?: any,
    ) {
        // Featured image is required - it's the main blog header image
        if (!featuredImageFile) {
            throw new BadRequestException('Featured image is required');
        }

        const slug = await this.generateUniqueSlug(createBlogDto.title);
        const imageSlug = this.generateImageSlug(createBlogDto.title);

        let featuredImageUrl: string | undefined;

        try {
            featuredImageUrl = await this.uploadFeaturedImage(featuredImageFile, imageSlug);
            if (!featuredImageUrl) {
                throw new BadRequestException('Failed to generate featured image URL');
            }
        } catch (error) {
            if (featuredImageUrl) await this.deleteCloudinaryUrl(featuredImageUrl);
            const message = (error as any)?.message;
            console.error('Featured image upload error:', message || error);
            throw new BadRequestException(`Failed to upload featured image: ${message || 'Unknown error'}`);
        }

        const blog = await prisma.blog.create({
            data: {
                slug,
                authorId,
                featuredImage: featuredImageUrl,
                title: createBlogDto.title,
                content: createBlogDto.content,
                category: createBlogDto.category,
                description: createBlogDto.description,
                readingTime: createBlogDto.readingTime || '5 min',
            },
            include: {
                author: {
                    select: { id: true, email: true, fullname: true },
                },
            },
        });

        return blog;
    }

    async updateBlog(
        id: number,
        updateBlogDto: UpdateBlogDto,
        featuredImageFile?: any,
    ) {
        const existingBlog = await prisma.blog.findUnique({ where: { id } });

        if (!existingBlog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        let slug = existingBlog.slug;
        if (updateBlogDto.title && updateBlogDto.title !== existingBlog.title) {
            slug = await this.generateUniqueSlug(updateBlogDto.title);
        }

        const imageSlug = this.generateImageSlug(updateBlogDto.title || existingBlog.title);

        let featuredImageUrl = existingBlog.featuredImage;

        try {
            if (featuredImageFile) {
                // Delete old featured image if it exists
                if (existingBlog.featuredImage) {
                    await this.deleteCloudinaryUrl(existingBlog.featuredImage);
                }
                const uploadedUrl = await this.uploadFeaturedImage(featuredImageFile, imageSlug);
                if (!uploadedUrl) {
                    throw new BadRequestException('Failed to generate featured image URL');
                }
                featuredImageUrl = uploadedUrl;
            }
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new BadRequestException('Failed to upload featured image');
        }

        const updateData: any = {
            slug,
        };

        // Only update featured image if a new one was provided
        if (featuredImageFile) {
            updateData.featuredImage = featuredImageUrl;
        }

        if (updateBlogDto.title !== undefined) updateData.title = updateBlogDto.title;
        if (updateBlogDto.content !== undefined) updateData.content = updateBlogDto.content;
        if (updateBlogDto.category !== undefined) updateData.category = updateBlogDto.category;
        if (updateBlogDto.description !== undefined) updateData.description = updateBlogDto.description;
        if (updateBlogDto.readingTime !== undefined) updateData.readingTime = updateBlogDto.readingTime;

        const updatedBlog = await prisma.blog.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: { id: true, email: true, fullname: true },
                },
            },
        });

        return updatedBlog;
    }

    async deleteBlog(id: number) {
        const existingBlog = await prisma.blog.findUnique({ where: { id } });

        if (!existingBlog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        // Only delete featured image - inline images in content are managed by Cloudinary directly
        if (existingBlog.featuredImage) {
            await this.deleteCloudinaryUrl(existingBlog.featuredImage);
        }

        await prisma.blog.delete({ where: { id } });

        return { message: 'Blog deleted successfully' };
    }

    async findAllBlogs() {
        return await prisma.blog.findMany({
            include: {
                author: {
                    select: { id: true, email: true, fullname: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findBlogById(id: number) {
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, email: true, fullname: true },
                },
            },
        });

        if (!blog) throw new NotFoundException(`Blog with ID ${id} not found`);
        return blog;
    }

    async findBlogBySlug(slug: string) {
        const blog = await prisma.blog.findUnique({
            where: { slug },
            include: {
                author: {
                    select: { id: true, email: true, fullname: true },
                },
            },
        });

        if (!blog) throw new NotFoundException(`Blog with slug ${slug} not found`);
        return blog;
    }

    async getBlogsByCategory(category: string) {
        return await prisma.blog.findMany({
            where: {
                category: { equals: category, mode: 'insensitive' },
            },
            include: {
                author: {
                    select: { id: true, email: true, fullname: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

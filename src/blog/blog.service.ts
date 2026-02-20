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
        let originalSlug = slug;

        while (true) {
            const existingBlog = await prisma.blog.findUnique({
                where: { slug },
            });

            if (!existingBlog) {
                break;
            }

            slug = `${originalSlug}-${counter}`;
            counter++;
        }

        return slug;
    }

    async createBlog(
        createBlogDto: CreateBlogDto,
        authorId: number,
        file?: any
    ) {
        const slug = await this.generateUniqueSlug(createBlogDto.title);
        const imageSlug = this.generateImageSlug(createBlogDto.title);

        if (!file) {
            throw new BadRequestException('Featured image is required');
        }

        let featuredImageUrl: string;

        try {
            const timestamp = Date.now();
            const customFileName = `${imageSlug}-${timestamp}`;
            const uploadResult = await this.cloudinaryService.uploadImageWithCustomName(file, customFileName);
            featuredImageUrl = uploadResult.secure_url;
        } catch (error) {
            throw new BadRequestException('Failed to upload image');
        }

        // Now readingTime is already string, no conversion needed
        const blogData = {
            slug,
            authorId,
            featuredImage: featuredImageUrl,
            title: createBlogDto.title,
            content: createBlogDto.content,
            category: createBlogDto.category,
            description: createBlogDto.description,
            readingTime: createBlogDto.readingTime || '5 min' // Default value if not provided
        };

        const blog = await prisma.blog.create({
            data: blogData,
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
            },
        });

        return blog;
    }

    async updateBlog(
        id: number,
        updateBlogDto: UpdateBlogDto,
        file?: any
    ) {
        const existingBlog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!existingBlog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        let slug = existingBlog.slug;
        let featuredImageUrl = existingBlog.featuredImage;

        // Generate new slug if title is being updated
        if (updateBlogDto.title && updateBlogDto.title !== existingBlog.title) {
            slug = await this.generateUniqueSlug(updateBlogDto.title);
        }

        // Upload new image if provided
        if (file) {
            try {
                const imageSlug = this.generateImageSlug(updateBlogDto.title || existingBlog.title);
                const timestamp = Date.now();
                const customFileName = `${imageSlug}-${timestamp}`;

                const uploadResult = await this.cloudinaryService.uploadImageWithCustomName(file, customFileName);
                featuredImageUrl = uploadResult.secure_url;

                // Delete old image from Cloudinary
                if (existingBlog.featuredImage) {
                    const oldPublicId = this.cloudinaryService.extractPublicId(existingBlog.featuredImage);
                    if (oldPublicId) {
                        await this.cloudinaryService.deleteImage(oldPublicId);
                    }
                }
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                throw new BadRequestException('Failed to upload image');
            }
        }

        // Prepare update data
        const updateData: any = {
            slug,
            featuredImage: featuredImageUrl,
        };

        // Only add fields that are provided in the DTO
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
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
            },
        });

        return updatedBlog;
    }

    // ... rest of the methods remain the same
    async deleteBlog(id: number) {
        const existingBlog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!existingBlog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        // Delete image from Cloudinary if exists
        if (existingBlog.featuredImage) {
            const publicId = this.cloudinaryService.extractPublicId(existingBlog.featuredImage);
            if (publicId) {
                await this.cloudinaryService.deleteImage(publicId);
            }
        }

        await prisma.blog.delete({
            where: { id },
        });

        return { message: 'Blog deleted successfully' };
    }

    async findAllBlogs() {
        const blogs = await prisma.blog.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return blogs;
    }

    async findBlogById(id: number) {
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
            },
        });

        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        return blog;
    }

    async findBlogBySlug(slug: string) {
        const blog = await prisma.blog.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
            },
        });

        if (!blog) {
            throw new NotFoundException(`Blog with slug ${slug} not found`);
        }

        return blog;
    }

    async getBlogsByCategory(category: string) {
        const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

        const blogs = await prisma.blog.findMany({
            where: {
                category: {
                    equals: normalizedCategory,
                    mode: 'insensitive' // Case-insensitive comparison
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullname: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return blogs;
    }
}
// src/cloudinary/cloudinary.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly projectFolder = 'Optimarz/blogs'; // Project-specific folder

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file || !file.data) {
        reject(new BadRequestException('No file provided'));
        return;
      }

      // Convert to base64 for Cloudinary
      const base64Image = `data:${file.mimetype};base64,${file.data.toString('base64')}`;

      cloudinary.uploader.upload(
        base64Image,
        {
          resource_type: 'image',
          folder: this.projectFolder, // Use project-specific folder
          format: 'webp',
          quality: 'auto',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new BadRequestException(`Image upload failed: ${error.message}`));
          } else if (result) {
            resolve(result);
          } else {
            reject(new BadRequestException('Image upload failed: Unknown error'));
          }
        }
      );
    });
  }

  async uploadImageWithCustomName(file: any, customName: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file || !file.data) {
        reject(new BadRequestException('No file provided'));
        return;
      }

      const base64Image = `data:${file.mimetype};base64,${file.data.toString('base64')}`;

      cloudinary.uploader.upload(
        base64Image,
        {
          resource_type: 'image',
          folder: this.projectFolder,
          public_id: customName, // Custom filename
          format: 'webp',
          quality: 'auto',
          overwrite: false, // Don't overwrite existing images with same name
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new BadRequestException(`Image upload failed: ${error.message}`));
          } else if (result) {
            resolve(result);
          } else {
            reject(new BadRequestException('Image upload failed: Unknown error'));
          }
        }
      );
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }

  async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(imageUrl);
      if (publicId) {
        await this.deleteImage(publicId);
      }
    } catch (error) {
      console.error('Failed to delete image by URL:', error);
    }
  }

  extractPublicId(imageUrl: string): string | null {
    try {
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1) {
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        return pathAfterUpload.replace(/\.[^/.]+$/, '');
      }
      return null;
    } catch {
      return null;
    }
  }

  // Get the project folder path
  getProjectFolder(): string {
    return this.projectFolder;
  }

  // List images in the project folder (optional utility method)
  async listProjectImages(): Promise<any> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: this.projectFolder,
        max_results: 50,
      });
      return result.resources;
    } catch (error) {
      console.error('Failed to list project images:', error);
      return [];
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { randomBytes } from 'crypto';

@Injectable()
export class FirebaseStorageService {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private readonly bucket: admin.storage.Storage;

  constructor() {
    this.bucket = admin.storage();
  }

  /**
   * Upload a file to Firebase Storage
   * @param buffer - File buffer
   * @param originalName - Original filename
   * @param folder - Folder path in bucket (e.g., 'feed', 'chat', 'profile-photos')
   * @returns Public URL of the uploaded file
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
  ): Promise<string> {
    try {
      // Generate unique filename
      const filename = this.generateUniqueFilename(originalName);
      const filePath = `${folder}/${filename}`;

      // Get file reference
      const file = this.bucket.bucket().file(filePath);

      // Upload file
      await file.save(buffer, {
        metadata: {
          contentType: this.getContentType(originalName),
        },
        public: true, // Make file publicly accessible
      });

      // Make file public and get URL
      await file.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucket.bucket().name}/${filePath}`;

      this.logger.log(`✅ File uploaded to Firebase Storage: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      this.logger.error(`❌ Failed to upload file to Firebase Storage`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param fileUrl - Full public URL of the file
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      // Format: https://storage.googleapis.com/bucket-name/folder/filename
      const urlParts = fileUrl.split('/');
      const bucketName = urlParts[3];
      const filePath = urlParts.slice(4).join('/');

      // Verify bucket matches
      if (bucketName !== this.bucket.bucket().name) {
        this.logger.warn(
          `⚠️ Bucket mismatch. Expected: ${this.bucket.bucket().name}, Got: ${bucketName}`,
        );
        return;
      }

      // Delete file
      const file = this.bucket.bucket().file(filePath);
      await file.delete();

      this.logger.log(`✅ File deleted from Firebase Storage: ${filePath}`);
    } catch (error) {
      // Log error but don't throw - file might already be deleted or not exist
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `⚠️ Failed to delete file from Firebase Storage: ${errorMessage}`,
      );
    }
  }

  /**
   * Generate unique filename with timestamp and random string
   * @param originalName - Original filename
   * @returns Unique filename
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Get MIME type from filename
   * @param filename - Filename
   * @returns MIME type
   */
  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension) return 'application/octet-stream';
    
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

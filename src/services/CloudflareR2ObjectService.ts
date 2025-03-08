import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { r2Config } from "../config/r2Config";
import { v4 as uuidv4 } from "uuid";
import "multer";
import { baseUrl } from "../config/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class CloudflareR2ObjectService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client(r2Config.s3);
  }

  // Uploads file to R2 S3
  async uploadFile(file: Express.Multer.File) {
    const key = uuidv4() + "-" + file.originalname;
    try {
      const uploadParams = {
        Bucket: r2Config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3.send(command);
      return baseUrl + "/images/" + key;
    } catch (error) {
      throw error;
    }
  }

  // Uploads file to R2 S3
  async uploadFileFromBuffer(
    fileBuffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<string> {
    const key = "compressed-" + filename;
    try {
      const uploadParams = {
        Bucket: r2Config.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3.send(command);
      return baseUrl + "/images/" + key;
    } catch (error) {
      throw error;
    }
  }

  // Gets a file from R2 S3
  async getFile(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: r2Config.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 3600, // 1 hour
      });

      return signedUrl;
    } catch (error) {
      throw error;
    }
  }

  // Deletes a file from R2 S3
  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: r2Config.bucket,
        Key: key,
      });
      await this.s3.send(command);
    } catch (error) {
      throw error;
    }
  }
}

export default new CloudflareR2ObjectService();

import {
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

  // Uploads an image to R2 S3
  async uploadImage(file: Express.Multer.File) {
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

  // Gets an image from R2 S3
  async getImage(key: string) {
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
}

export default new CloudflareR2ObjectService();

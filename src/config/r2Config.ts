export const r2Config = {
  s3: {
    region: "us-east-1",
    endpoint:
      process.env.CLOUDFLARE_S3_CLIENT_ENDPOINT ||
      "https://accountId.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId:
        process.env.CLOUDFLARE_S3_ACCESS_KEY_ID || "temporary_access_key_id",
      secretAccessKey:
        process.env.CLOUDFLARE_S3_SECRET_ACCESS_KEY || "temporary_access_key",
    },
  },
  bucket: process.env.CLOUDFLARE_S3_BUCKET || "temporary_bucket",
};

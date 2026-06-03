import { S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "@/lib/env";

export function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function r2BucketName() {
  return requireEnv("R2_BUCKET_NAME");
}

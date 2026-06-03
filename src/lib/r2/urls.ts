import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client, r2BucketName } from "@/lib/r2/client";

export async function createPresignedPutUrl(input: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: r2BucketName(),
    Key: input.key,
    ContentType: input.contentType,
  });

  return getSignedUrl(createR2Client(), command, { expiresIn: input.expiresIn ?? 600 });
}

export async function createPresignedGetUrl(key: string, expiresIn = 900) {
  const command = new GetObjectCommand({
    Bucket: r2BucketName(),
    Key: key,
  });

  return getSignedUrl(createR2Client(), command, { expiresIn });
}

import "server-only";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { env } from "~/env";

function getS3Config() {
  const region = env.S3_REGION;
  const accessKeyId = env.S3_ACCESS_KEY;
  const secretAccessKey = env.S3_SECRET_KEY;
  const bucket = env.S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("S3 avatar storage is not configured");
  }

  return { region, accessKeyId, secretAccessKey, bucket };
}

function createClient() {
  const { region, accessKeyId, secretAccessKey } = getS3Config();
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadObject(file: File) {
  const { bucket } = getS3Config();
  const objectName = crypto.randomUUID();

  await createClient().send(
    new PutObjectCommand({
      Body: new Uint8Array(await file.arrayBuffer()),
      Bucket: bucket,
      Key: objectName,
      ContentType: file.type,
    }),
  );

  return { url: `/api/avatars/${objectName}` };
}

export async function getFileFromS3(key: string) {
  const { bucket } = getS3Config();
  return createClient().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
}

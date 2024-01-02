import {
  DeleteObjectsCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export function uploadFile(fileBuffer, fileKey, mimetype) {
  const uploadParams: PutObjectCommandInput = {
    ACL: "public-read",
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileKey,
    ContentType: mimetype,
  };

  return s3Client.send(new PutObjectCommand(uploadParams));
}

export function deleteFile(fileKey) {
  const input = {
    Bucket: bucketName,
    Delete: {
      Objects: [
        {
          Key: fileKey,
        },
      ],
      Quiet: true || false,
    },
  };
  const command = new DeleteObjectsCommand(input);

  return s3Client.send(command);
}

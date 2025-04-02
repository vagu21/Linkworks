import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { EmailAttachment } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { Readable } from "stream";
import { Upload } from "@aws-sdk/lib-storage";


const BucketName = process.env.AWS_S3_BUCKET_NAME || "";

function getClient() {
  const s3Client = new S3Client({
    // endpoint: process.env.CACHE_S3_BUCKET_ENDPOINT,
    region: process.env.AWS_REGION,
    // forcePathStyle: false,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
  return s3Client;
}

export interface Bucket {
  id: string;
  name: string;
  owner: string;
  file_size_limit?: number;
  allowed_mime_types?: string[];
  created_at: string;
  updated_at: string;
  public: boolean;
}

export async function getOrCreateS3Bucket(folderName: string, isPublic: boolean) {
  const s3Client = getClient();

  if (!folderName.endsWith("/")) {
    folderName += "/";
  }

  try {
    // Check if the folder exists
    const data = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BucketName,
        Prefix: folderName,
        MaxKeys: 1,
      })
    );

    if (data.Contents && data.Contents.length > 0) {
      return {
        data: {
          id: BucketName,
          name: `${BucketName}/${folderName}`,
        },
        error: null,
      };
    }
  } catch (error) {
    console.error("Error checking folder:", error);
    return { data: null, error };
  }

  try {
    // Ensure the bucket exists before creating a folder
    await s3Client.send(new HeadBucketCommand({ Bucket: BucketName }));

    return {
      data: {
        id: BucketName,
        name: `${BucketName}/${folderName}`,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return { data: null, error };
  }
}

export async function createS3File(
  folderName: string,
  path: string,
  file:
    | File
    | ReadableStream<Uint8Array>
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | Buffer
    | FormData
    | NodeJS.ReadableStream
    | ReadableStream<Uint8Array>
    | URLSearchParams
    | string,
  contentType?: string
): Promise<{
  id: string;
  publicUrl: string | null;
}> {
  const s3Client = getClient();

  if (!folderName.endsWith("/")) {
    folderName += "/";
  }

  const fullPath = folderName + path;

  // Ensure ReadableStream is properly converted
  if (file instanceof ReadableStream) {
    const reader = file.getReader();
    const stream = new ReadableStream({
      start(controller) {
        async function push() {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          push();
        }
        push();
      },
    });

    file = stream as unknown as NodeJS.ReadableStream;
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BucketName,
      Key: fullPath,
      Body: file instanceof ArrayBuffer ? new Uint8Array(file) : (file as any),
      ContentType: contentType || "application/octet-stream",
    },
  });

  await upload.done(); // Wait for upload to finish

  return {
    id: fullPath,
    publicUrl: await getS3DownloadUrl(folderName, path),
  };
}

export async function getS3DownloadUrl(folderName: string, path: string): Promise<string | null> {
  if (!folderName.endsWith("/")) {
    folderName += "/";
  }
  const fullPath = folderName + path;
  const urlParams = new URLSearchParams();
  urlParams.append('path', fullPath);
  return `/api/s3/download?${urlParams.toString()}`;
}


export function getS3AttachmentBucket() {
  return "email-attachments";
}

export async function getS3FileDownload(fullPath: string): Promise<Blob | null> {
  try {
    const s3Client = getClient();
    const command = new GetObjectCommand({ Bucket: BucketName, Key: fullPath });
    const { Body } = await s3Client.send(command);
    if (!Body) {
      throw new Error("Could not download S3 file: No data returned");
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as Readable) {
      chunks.push(chunk);
    }

    return new Blob(chunks);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Could not download S3 file: " + error.message);
    } else {
      throw new Error("Could not download S3 file: Unknown error");
    }
  }
}

export function getS3AttachmentPath(attachment: EmailAttachment) {
  return attachment.id + "-" + attachment.name;
}

export async function createS3FileFromMedia(folderName: string, id: string, data: MediaDto) {
  const blobFile = await fetch(`${data.file}`);
  const file = new File([await blobFile.blob()], data.name, { type: data.type });
  try {
    return await createS3File(folderName, `${id}`, file);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export async function deleteS3File(folderName: string, path: string) {
  try {
    if (!folderName.endsWith("/")) {
      folderName += "/";
    }
    const s3Client = getClient();
    const command = new DeleteObjectCommand({ Bucket: BucketName, Key: folderName + path });
    await s3Client.send(command);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Could not delete S3 file: " + error.message);
    } else {
      throw new Error("Could not delete S3 file: Unknown error");
    }
  }
}

export async function storeS3File({ bucket, content, id, replace }: { bucket: string; content: string; id: string; replace?: boolean }) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    // eslint-disable-next-line no-console
    console.log("No AWS credentials, skipping file upload");
    return content;
  }

  if (content.startsWith("http") && !replace) {
    return content;
  }

  try {
    const blob = await (await fetch(content)).blob();
    const file = new File([blob], id, { type: blob.type || "application/octet-stream" });

    const createdFile = await createS3File(bucket, id, file);
    if (createdFile.publicUrl) {
      return createdFile.publicUrl;
    }
  } catch (e) {
    console.log("Could not create S3 file: " + e);
  }
  return content;
}

export async function getS3Buckets() {
  const s3Client = getClient();
  const command = new ListBucketsCommand({});
  const response = await s3Client.send(command);
  return response.Buckets;
}

export async function updateS3Bucket(id: string, data: { public: boolean }) {
  throw new Error(` Method Not implemented ! \nMethod: updateS3Bucket ! \nS3 polices cant be modified from client`);
}

export async function deleteS3Bucket(folderName: string) {
  try {
    const s3Client = getClient();
    if (!folderName.endsWith("/")) {
      folderName += "/";
    }
    // List all objects in the bucket
    const Contents = await getS3Files(folderName);

    if (Contents?.length) {
      // Delete all objects first
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: BucketName,
        Delete: {
          Objects: Contents.map(({ Key }) => ({ Key })),
        },
      });
      await s3Client.send(deleteCommand);
    }

    // NO need to delete bucket, hence below code is commented
    // const deleteBucketCommand = new DeleteBucketCommand({ Bucket: BucketName, });
    // await s3Client.send(deleteBucketCommand);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Could not delete S3 bucket: " + error.message);
    } else {
      throw new Error("Could not delete S3 bucket: Unknown error");
    }
  }
}

export async function getS3Files(folderName: string) {
  try {
    if (!folderName.endsWith("/")) {
      folderName += "/";
    }
    const s3Client = getClient();
    const command = new ListObjectsV2Command({ Bucket: BucketName, Prefix: folderName });
    const response = await s3Client.send(command);
    return response.Contents;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Could not list S3 files: " + error.message);
    } else {
      throw new Error("Could not list S3 files: Unknown error");
    }
  }
}

import * as Minio from "minio";

let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (minioClient) {
    return minioClient;
  }

  minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: parseInt(process.env.MINIO_PORT || "443"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ROOT_USER!,
    secretKey: process.env.MINIO_ROOT_PASSWORD!,
    region: process.env.MINIO_REGION || "us-east-1"
  });

  return minioClient;
}

// Initialize bucket if it doesn't exist
export async function initializeMinioBucket() {
  const client = getMinioClient();
  const bucketName = "futurostech"; // Nome do bucket fixo para o projeto

  try {
    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      await client.makeBucket(bucketName, process.env.MINIO_REGION || "us-east-1");
      console.log(`Created MinIO bucket: ${bucketName}`);

      // Set bucket policy to allow public read
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };

      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Set public read policy for bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error("Failed to initialize MinIO bucket:", error);
    throw error;
  }
} 
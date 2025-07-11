declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      MINIO_ENDPOINT: string;
      MINIO_PORT: string;
      MINIO_USE_SSL: string;
      MINIO_ROOT_USER: string;
      MINIO_ROOT_PASSWORD: string;
      MINIO_REGION: string;
      PYTHON_API_URL: string;
      [key: string]: string | undefined;
    }
  }
} 
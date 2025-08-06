-- Primeiro, remover a relação entre User e VerificationCode
ALTER TABLE "VerificationCode" DROP CONSTRAINT IF EXISTS "VerificationCode_userId_fkey";

-- Remover o índice existente
DROP INDEX IF EXISTS "VerificationCode_userId_idx";

-- Renomear a coluna userId para email (se existir)
ALTER TABLE "VerificationCode" 
  DROP COLUMN IF EXISTS "userId",
  ADD COLUMN IF NOT EXISTS "email" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT false;

-- Criar novo índice para email
CREATE INDEX IF NOT EXISTS "VerificationCode_email_idx" ON "VerificationCode"("email");

-- Atualizar o Prisma_migrations para registrar esta migração
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  'verification_code_email',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  NOW(),
  'verification_code_email',
  NULL,
  NULL,
  NOW(),
  1
)
ON CONFLICT (id) DO NOTHING;

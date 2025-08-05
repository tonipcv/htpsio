-- Migração para definir plano 'free' para todos os usuários sem plano
-- Atualiza registros existentes na tabela Subscription
UPDATE "Subscription"
SET "plan" = 'free'
WHERE "plan" IS NULL OR "plan" = '';

-- Atualiza status para 'ativo' onde for nulo
UPDATE "Subscription"
SET "status" = 'active'
WHERE "status" IS NULL OR "status" = '';

-- Insere registros de assinatura para usuários que não têm assinatura
INSERT INTO "Subscription" ("id", "userId", "plan", "status", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(), -- gera um UUID para o id
    u."id", 
    'free', 
    'active',
    NOW(), -- createdAt
    NOW() -- updatedAt
FROM "users" u
WHERE NOT EXISTS (
    SELECT 1 FROM "Subscription" s WHERE s."userId" = u."id"
);

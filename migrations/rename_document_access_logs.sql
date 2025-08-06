-- Renomear a tabela para corresponder ao modelo Prisma (PascalCase)
ALTER TABLE IF EXISTS public.document_access_logs RENAME TO "DocumentAccessLog";

-- Renomear as colunas para corresponder ao modelo Prisma (camelCase)
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN document_id TO "documentId";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN user_id TO "userId";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN visitor_token TO "visitorToken";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN access_start_time TO "accessStartTime";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN access_end_time TO "accessEndTime";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN user_agent TO "userAgent";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN ip_address TO "ipAddress";
ALTER TABLE IF EXISTS public."DocumentAccessLog" RENAME COLUMN created_at TO "createdAt";

-- Atualizar as restrições de chave estrangeira
ALTER TABLE IF EXISTS public."DocumentAccessLog" 
  DROP CONSTRAINT IF EXISTS document_access_logs_document_id_fkey,
  ADD CONSTRAINT "DocumentAccessLog_documentId_fkey" 
  FOREIGN KEY ("documentId") REFERENCES public."Document"(id);

ALTER TABLE IF EXISTS public."DocumentAccessLog" 
  DROP CONSTRAINT IF EXISTS document_access_logs_user_id_fkey,
  ADD CONSTRAINT "DocumentAccessLog_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES public.users(id);

-- Atualizar os índices
DROP INDEX IF EXISTS document_access_logs_document_id_idx;
CREATE INDEX IF NOT EXISTS "DocumentAccessLog_documentId_idx" ON public."DocumentAccessLog"("documentId");

DROP INDEX IF EXISTS document_access_logs_user_id_idx;
CREATE INDEX IF NOT EXISTS "DocumentAccessLog_userId_idx" ON public."DocumentAccessLog"("userId");

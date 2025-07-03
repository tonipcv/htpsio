-- Primeiro remove possíveis duplicatas
DELETE FROM "Device" a USING "Device" b
WHERE a.id > b.id 
AND a."externalId" = b."externalId" 
AND a."tenantId" = b."tenantId";

-- Adiciona a constraint única
ALTER TABLE "Device" ADD CONSTRAINT "Device_externalId_tenantId_key" UNIQUE ("externalId", "tenantId"); 
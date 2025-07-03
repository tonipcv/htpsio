# Troubleshooting Guide

## Problemas Identificados e Soluções

### 1. Dashboard Data - Erro "Cannot read properties of undefined (reading 'count')"

**Problema**: A API do dashboard estava tentando acessar propriedades de objetos que poderiam ser `undefined` ou `null`.

**Solução Implementada**:
- Adicionadas verificações defensivas em todas as consultas ao banco de dados
- Uso de `optional chaining` (`?.`) para acessar propriedades aninhadas
- Implementação de valores padrão (`|| 0`, `|| []`) para evitar undefined
- Adicionado tratamento de erro que retorna dados padrão em caso de falha

**Arquivo Corrigido**: `src/app/api/dashboard/route.ts`

### 2. Bitdefender Stats - Erro "Invalid params"

**Problema**: A API do Bitdefender estava falhando porque o `companyId` não estava sendo enviado corretamente nas requisições.

**Solução Implementada**:
- Adicionado `companyId` explícito em todas as chamadas `makeRequest`
- Melhorado tratamento de erros na função `makeRequest`
- Adicionadas validações de configuração obrigatórias
- Implementado logging detalhado para debug
- Criada rota de verificação de configuração

**Arquivos Corrigidos**: 
- `src/app/api/security/bitdefender/stats/route.ts`
- `src/app/api/security/bitdefender/config.ts`
- `src/app/api/security/bitdefender/check-config/route.ts` (novo)

### 3. Bitdefender Stats - Erro "The required parameter is missing : parentId"

**Problema**: A chamada para `incidents/getIncidentsList` estava falhando porque não estava sendo fornecido o parâmetro `parentId` obrigatório.

**Diagnóstico**: A API do Bitdefender requer um `parentId` para buscar incidents, que deve ser o `id` de um item do network inventory.

**Solução Implementada**:
- Modificada a lógica para primeiro buscar o network inventory
- Extraído o `id` do primeiro item retornado
- Usado esse `id` como `parentId` na chamada `getIncidentsList`
- Implementado tratamento de erro defensivo para continuar sem incidents em caso de falha

**Arquivo Corrigido**: `src/app/api/security/bitdefender/stats/route.ts`

**Código de Correção**:
```typescript
// Primeiro buscar o network inventory
const endpointsResponse = await makeRequest('network', 'getNetworkInventoryItems', {
  companyId: BITDEFENDER_CONFIG.COMPANY_ID
});

// Extrair o parentId do primeiro item
if (endpoints.length > 0) {
  const parentId = endpoints[0].id;
  
  // Usar o parentId na chamada de incidents
  const incidentsResponse = await makeRequest('incidents', 'getIncidentsList', {
    companyId: BITDEFENDER_CONFIG.COMPANY_ID,
    parentId: parentId // ← PARÂMETRO OBRIGATÓRIO
  });
}
```

## Verificação de Configuração

### Variáveis de Ambiente Necessárias

Para o Bitdefender funcionar corretamente, você precisa configurar estas variáveis de ambiente:

```bash
BITDEFENDER_API_KEY=sua_api_key_aqui
BITDEFENDER_COMPANY_ID=seu_company_id_aqui
BITDEFENDER_API_URL=https://cloud.gravityzone.bitdefender.com
```

### Como Verificar a Configuração

1. **Via API**: Acesse `GET /api/security/bitdefender/check-config` para verificar se todas as configurações estão corretas.

2. **Via Logs**: Verifique os logs do servidor para mensagens de erro relacionadas à configuração.

## Melhorias Implementadas

### 1. Verificações Defensivas
- Todos os acessos a propriedades de objetos agora usam optional chaining
- Valores padrão definidos para evitar undefined/null
- Tratamento adequado de erros com fallbacks

### 2. Logging Melhorado
- Logs detalhados para requests do Bitdefender
- Informações de debug para facilitar troubleshooting
- Mensagens de erro mais específicas

### 3. Validação de Configuração
- Verificação automática de variáveis de ambiente necessárias
- Rota dedicada para verificação de configuração
- Mensagens de erro claras para configurações faltantes

### 4. Dependências de API Corretas
- Implementação correta da sequência de chamadas da API Bitdefender
- Uso adequado de parâmetros obrigatórios como `parentId`
- Tratamento robusto de falhas em chamadas dependentes

## Como Evitar Problemas Futuros

### 1. Sempre Use Verificações Defensivas
```typescript
// ❌ Evite
const count = response.data.count;

// ✅ Use
const count = response?.data?.count || 0;
```

### 2. Implemente Tratamento de Erro Adequado
```typescript
// ❌ Evite
try {
  const data = await fetchData();
  return data;
} catch (error) {
  throw error;
}

// ✅ Use
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Error fetching data:', error);
  return defaultData;
}
```

### 3. Configure Variáveis de Ambiente
- Use um arquivo `.env.local` para desenvolvimento
- Configure todas as variáveis necessárias em produção
- Documente quais variáveis são obrigatórias

### 4. Teste as APIs
- Use a rota de verificação de configuração regularmente
- Monitore logs para identificar problemas precocemente
- Implemente health checks para APIs externas

### 5. Entenda Dependências de API
- Leia a documentação da API externa para entender parâmetros obrigatórios
- Implemente a sequência correta de chamadas quando há dependências
- Teste cenários onde chamadas dependentes falham

## Monitoramento

Para evitar problemas similares no futuro:

1. **Monitore os logs**: Configure alertas para erros recorrentes
2. **Teste regularmente**: Use as rotas de verificação de configuração
3. **Valide dados**: Sempre verifique se os dados retornados pela API estão no formato esperado
4. **Use TypeScript**: Aproveite a tipagem para detectar problemas em tempo de compilação
5. **Teste dependências**: Verifique se APIs externas estão funcionando corretamente

## Contato

Se você encontrar problemas similares ou tiver dúvidas sobre as correções implementadas, verifique:

1. Os logs do servidor
2. A configuração das variáveis de ambiente
3. A conectividade com APIs externas
4. A estrutura do banco de dados
5. A documentação da API externa para parâmetros obrigatórios

As correções implementadas são robustas e devem resolver os problemas reportados, mas sempre monitore o sistema para identificar novos problemas rapidamente. 
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import translations & error utilities
import { ptBR } from '@/i18n/errors/pt-BR';
import { enUS } from '@/i18n/errors/en-US';
import { esES } from '@/i18n/errors/es-ES';
import { getErrorMessageByCode } from '@/i18n/errors/index';
import { resolveErrorMessage } from '@/utils/errorUtils';
import { ApiError } from '@/services/api/httpClient';

console.log('=== TESTE DE VALIDAÇÃO: CÓDIGOS DE ERRO E I18N DO NINHOAPP ===\n');

// 1. Ler ErrorCode.cs do ninhoapp-api
const errorCodePath = path.resolve(
  rootDir,
  '..',
  'ninhoapp-api',
  'NinhoApp.Shared',
  'ErrorCode.cs'
);

if (!fs.existsSync(errorCodePath)) {
  console.error(`ERRO: Arquivo ErrorCode.cs não encontrado em ${errorCodePath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(errorCodePath, 'utf8');
const enumBodyMatch = fileContent.match(/public\s+enum\s+ErrorCode\s*\{([\s\S]*?)\}/);

if (!enumBodyMatch) {
  console.error('ERRO: Não foi possível extrair o enum ErrorCode de ErrorCode.cs');
  process.exit(1);
}

const enumCodes = enumBodyMatch[1]
  .split('\n')
  .map((line) => line.trim().replace(/,$/, ''))
  .filter((line) => line && !line.startsWith('//') && !line.startsWith('/*'));

console.log(`1. Total de códigos de erro no backend (ErrorCode.cs): ${enumCodes.length}`);

// 2. Verificar cobertura em cada dicionário
const dictionaries = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

let failureCount = 0;

for (const [lang, dict] of Object.entries(dictionaries)) {
  const missing: string[] = [];
  for (const code of enumCodes) {
    const val = (dict as Record<string, string>)[code];
    if (!val || typeof val !== 'string' || val.trim() === '') {
      missing.push(code);
    }
  }

  if (missing.length > 0) {
    console.error(`[FALHA] ${lang}: Faltam ${missing.length} códigos no dicionário:`, missing);
    failureCount += missing.length;
  } else {
    console.log(`[PASS] ${lang}: 100% de cobertura (${enumCodes.length}/${enumCodes.length} códigos traduzidos).`);
  }
}

// 3. Teste de tradução por código
console.log('\n2. Testando resolução de tradução por código estável:');
const sampleCode = 'ShoppingList_NotFound';
const samplePt = getErrorMessageByCode(sampleCode, 'pt-BR');
const sampleEn = getErrorMessageByCode(sampleCode, 'en-US');
const sampleEs = getErrorMessageByCode(sampleCode, 'es-ES');

console.log(`- ${sampleCode} (pt-BR): "${samplePt}"`);
console.log(`- ${sampleCode} (en-US): "${sampleEn}"`);
console.log(`- ${sampleCode} (es-ES): "${sampleEs}"`);

if (samplePt !== 'Lista de compras não encontrada.') {
  console.error('[FALHA] Tradução pt-BR incorreta para ShoppingList_NotFound');
  failureCount++;
}
if (sampleEn !== 'Shopping list not found.') {
  console.error('[FALHA] Tradução en-US incorreta para ShoppingList_NotFound');
  failureCount++;
}
if (sampleEs !== 'Lista de compras no encontrada.') {
  console.error('[FALHA] Tradução es-ES incorreta para ShoppingList_NotFound');
  failureCount++;
}

// 4. Teste de ApiError com código conhecido (a mensagem traduzida do frontend prevalece)
console.log('\n3. Testando ApiError com código conhecido:');
const apiErrKnown = new ApiError(
  'Texto vindo da API que deve ser ignorado',
  400,
  'User_InvalidCredentials',
  'Texto vindo da API que deve ser ignorado'
);

const resolvedPt = resolveErrorMessage(apiErrKnown, undefined, 'pt-BR');
console.log(`- User_InvalidCredentials resolvido em pt-BR: "${resolvedPt}"`);
if (resolvedPt !== 'As credenciais informadas são inválidas.') {
  console.error(`[FALHA] Esperava "As credenciais informadas são inválidas.", recebeu: "${resolvedPt}"`);
  failureCount++;
} else {
  console.log('[PASS] A mensagem traduzida do frontend teve prioridade total.');
}

const resolvedEn = resolveErrorMessage(apiErrKnown, undefined, 'en-US');
console.log(`- User_InvalidCredentials resolvido em en-US: "${resolvedEn}"`);
if (resolvedEn !== 'The provided credentials are invalid.') {
  console.error(`[FALHA] Esperava "The provided credentials are invalid.", recebeu: "${resolvedEn}"`);
  failureCount++;
} else {
  console.log('[PASS] A tradução para en-US funcionou corretamente.');
}

// 5. Teste de ApiError com código desconhecido (fallback da API é usado)
console.log('\n4. Testando ApiError com código desconhecido (fallback para message da API):');
const unknownApiErr = new ApiError(
  'Erro novo da API v2',
  400,
  'FutureFeature_SomeNewErrorCode',
  'Erro novo da API v2'
);

const resolvedUnknown = resolveErrorMessage(unknownApiErr);
console.log(`- Código desconhecido resolvido: "${resolvedUnknown}"`);
if (resolvedUnknown !== 'Erro novo da API v2') {
  console.error(`[FALHA] Esperava fallback "Erro novo da API v2", recebeu: "${resolvedUnknown}"`);
  failureCount++;
} else {
  console.log('[PASS] Fallback da API respeitado com sucesso quando o código é desconhecido.');
}

// 6. Teste de duck typing (objeto simples { code: '...' })
console.log('\n5. Testando objeto duck-typed com code:');
const duckTyped = { code: 'BankAccount_AccountNotFound' };
const resolvedDuck = resolveErrorMessage(duckTyped, undefined, 'pt-BR');
console.log(`- Duck-typed BankAccount_AccountNotFound: "${resolvedDuck}"`);
if (resolvedDuck !== 'Conta bancária não encontrada.') {
  console.error(`[FALHA] Esperava "Conta bancária não encontrada.", recebeu: "${resolvedDuck}"`);
  failureCount++;
} else {
  console.log('[PASS] Duck-typing de código de erro funcionou perfeitamente.');
}

// Final
if (failureCount === 0) {
  console.log('\n======================================================');
  console.log(' TODOS OS 139 CÓDIGOS DE ERRO E CENÁRIOS FORAM VALIDADOS!');
  console.log('======================================================\n');
  process.exit(0);
} else {
  console.error(`\n[ERRO] Ocorreram ${failureCount} falhas nos testes.`);
  process.exit(1);
}

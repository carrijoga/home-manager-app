# Configuração de Ambientes

O Ninho suporta múltiplos ambientes (development, staging, production) através de variáveis de ambiente.

## Variáveis de Ambiente

### `VITE_ENVIRONMENT`

Define qual ambiente está sendo executado. Valores possíveis:
- `development` (padrão) - Ambiente de desenvolvimento local
- `staging` - Ambiente de testes/homologação
- `production` - Ambiente de produção

### `VITE_DATA_MODE`

Define a origem dos dados. Valores possíveis:
- `mock` (padrão) - Usa dados mockados localmente
- `api` - Consome API REST externa

### URLs da API

Cada ambiente possui sua própria URL de API:

- **`VITE_API_URL`** - URL para desenvolvimento local (padrão: `http://localhost:3001/api`)
- **`VITE_API_STAGING_URL`** - URL para staging (padrão: `https://staging-api.ninho.app/api`)
- **`VITE_API_PRODUCTION_URL`** - URL para production (padrão: `https://api.ninho.app/api`)

## Arquivos de Configuração

O projeto inclui três arquivos `.env` pré-configurados:

### `.env.development`
Ambiente de desenvolvimento local com dados mockados:
```bash
VITE_DATA_MODE=mock
VITE_ENVIRONMENT=development
```

### `.env.staging`
Ambiente de staging conectado à API de testes:
```bash
VITE_DATA_MODE=api
VITE_ENVIRONMENT=staging
```

### `.env.production`
Ambiente de produção conectado à API real:
```bash
VITE_DATA_MODE=api
VITE_ENVIRONMENT=production
```

## Como Usar

### Desenvolvimento Local

```bash
# Usar ambiente de desenvolvimento (padrão, com dados mockados)
npm run dev

# Ou copiar .env.development para .env
cp .env.development .env
npm run dev
```

### Staging

```bash
# Executar em modo staging
npm run dev:staging

# Build para staging
npm run build:staging

# Preview do build de staging
npm run preview:staging

# Ou copiar .env.staging para .env
cp .env.staging .env
npm run dev
```

### Production

```bash
# Executar em modo production (para testes locais)
npm run dev:production

# Build para production
npm run build:production

# Preview do build de production
npm run preview:production

# Ou copiar .env.production para .env
cp .env.production .env
npm run dev
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia dev server em modo development |
| `npm run dev:staging` | Inicia dev server em modo staging |
| `npm run dev:production` | Inicia dev server em modo production |
| `npm run build` | Build para development |
| `npm run build:staging` | Build para staging |
| `npm run build:production` | Build para production |
| `npm run preview` | Preview do build de development |
| `npm run preview:staging` | Preview do build de staging |
| `npm run preview:production` | Preview do build de production |

## Fluxo de Deploy

### Desenvolvimento Local
1. Use `npm run dev` (dados mockados)
2. Teste funcionalidades localmente
3. Commit e push para branch de desenvolvimento

### Deploy para Staging
1. Configure `.env.staging` com as URLs corretas
2. Execute `npm run build:staging`
3. Deploy da pasta `dist/` para servidor de staging
4. Teste integração com API de staging

### Deploy para Production
1. Configure `.env.production` com as URLs corretas
2. Execute `npm run build:production`
3. Deploy da pasta `dist/` para servidor de produção
4. Monitore logs e métricas

## Configuração no Vercel/Netlify

Ao fazer deploy em plataformas como Vercel ou Netlify, configure as variáveis de ambiente diretamente no painel:

### Para Staging:
```
VITE_ENVIRONMENT=staging
VITE_DATA_MODE=api
VITE_API_STAGING_URL=https://staging-api.ninho.app/api
```

### Para Production:
```
VITE_ENVIRONMENT=production
VITE_DATA_MODE=api
VITE_API_PRODUCTION_URL=https://api.ninho.app/api
```

## Como Funciona

O arquivo [`src/services/api/config.js`](../src/services/api/config.js) seleciona automaticamente a URL correta baseado na variável `VITE_ENVIRONMENT`:

```javascript
const API_URLS = {
  development: VITE_API_URL,
  staging: VITE_API_STAGING_URL,
  production: VITE_API_PRODUCTION_URL
};

// Seleciona a URL com base no ambiente atual
export const API_CONFIG = {
  baseURL: API_URLS[VITE_ENVIRONMENT] || API_URLS.development
};
```

## Verificação do Ambiente

Para verificar qual ambiente está sendo usado, abra o console do navegador e execute:

```javascript
console.log('Environment:', import.meta.env.VITE_ENVIRONMENT);
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Data Mode:', import.meta.env.VITE_DATA_MODE);
```

## Troubleshooting

### Mudanças não refletem após alterar .env

Reinicie o dev server:
```bash
# Ctrl+C para parar
npm run dev
```

### API não está sendo chamada

Verifique se `VITE_DATA_MODE=api` está configurado. Em modo `mock`, a API não será chamada.

### URL da API incorreta

1. Verifique o arquivo `.env` correto está sendo usado
2. Confirme que a variável `VITE_ENVIRONMENT` está definida corretamente
3. Verifique se as URLs estão definidas sem trailing slash

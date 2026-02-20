# Configuração de Deploy

Exemplos de configuração de variáveis de ambiente para diferentes plataformas de deploy.

## Vercel

### Criar Ambientes

No dashboard da Vercel, você pode configurar ambientes diferentes:

1. **Production** - Deploy automático da branch `main`
2. **Preview (Staging)** - Deploy automático de pull requests ou branch `staging`

### Variáveis de Ambiente

#### Production Environment

```bash
# Em: Settings > Environment Variables > Production
VITE_ENVIRONMENT=production
VITE_DATA_MODE=api
VITE_API_PRODUCTION_URL=https://api.ninho.app/api
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://ninho.app/auth/google/callback
```

#### Preview (Staging) Environment

```bash
# Em: Settings > Environment Variables > Preview
VITE_ENVIRONMENT=staging
VITE_DATA_MODE=api
VITE_API_STAGING_URL=https://staging-api.ninho.app/api
VITE_GOOGLE_CLIENT_ID=your-staging-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://staging.ninho.app/auth/google/callback
```

### Build Commands

Vercel detecta automaticamente os comandos, mas você pode customizar:

```json
{
  "buildCommand": "npm run build:production",
  "outputDirectory": "dist"
}
```

## Netlify

### Criar Ambientes

1. **Production** - Site principal
2. **Branch Deploy** - Configure uma branch `staging` para deploys automáticos

### Variáveis de Ambiente

#### Site Settings > Environment Variables

**Production:**
```bash
VITE_ENVIRONMENT=production
VITE_DATA_MODE=api
VITE_API_PRODUCTION_URL=https://api.ninho.app/api
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://ninho.app/auth/google/callback
```

**Staging (Branch Deploy):**
```bash
VITE_ENVIRONMENT=staging
VITE_DATA_MODE=api
VITE_API_STAGING_URL=https://staging-api.ninho.app/api
VITE_GOOGLE_CLIENT_ID=your-staging-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://staging.ninho.app/auth/google/callback
```

### netlify.toml

Crie um arquivo `netlify.toml` na raiz do projeto:

```toml
[build]
  command = "npm run build:production"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

# Production context
[context.production]
  command = "npm run build:production"

# Branch deploys
[context.staging]
  command = "npm run build:staging"

# Deploy previews
[context.deploy-preview]
  command = "npm run build:staging"

# Redirects and headers
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## GitHub Actions

Exemplo de workflow para CI/CD com múltiplos ambientes:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main      # Production
      - staging   # Staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # Deploy to Production
      - name: Build and Deploy Production
        if: github.ref == 'refs/heads/main'
        env:
          VITE_ENVIRONMENT: production
          VITE_DATA_MODE: api
          VITE_API_PRODUCTION_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.PRODUCTION_GOOGLE_CLIENT_ID }}
        run: |
          npm run build:production
          # Adicione aqui seu comando de deploy (ex: vercel, netlify, aws, etc)
      
      # Deploy to Staging
      - name: Build and Deploy Staging
        if: github.ref == 'refs/heads/staging'
        env:
          VITE_ENVIRONMENT: staging
          VITE_DATA_MODE: api
          VITE_API_STAGING_URL: ${{ secrets.STAGING_API_URL }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.STAGING_GOOGLE_CLIENT_ID }}
        run: |
          npm run build:staging
          # Adicione aqui seu comando de deploy
```

### GitHub Secrets

Configure em: `Settings > Secrets and variables > Actions`

```
PRODUCTION_API_URL=https://api.ninho.app/api
PRODUCTION_GOOGLE_CLIENT_ID=your-production-client-id
STAGING_API_URL=https://staging-api.ninho.app/api
STAGING_GOOGLE_CLIENT_ID=your-staging-client-id
```

## AWS Amplify

### Console Configuration

1. Conecte seu repositório GitHub
2. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build:production
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables

Em: `App Settings > Environment Variables`

**Production:**
```
VITE_ENVIRONMENT=production
VITE_DATA_MODE=api
VITE_API_PRODUCTION_URL=https://api.ninho.app/api
```

**Staging Branch:**
- Crie uma branch `staging` em `App Settings > General`
- Configure variáveis específicas para staging

## Docker

Exemplo de `Dockerfile` multi-stage com suporte a ambientes:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build args for environment
ARG VITE_ENVIRONMENT=production
ARG VITE_DATA_MODE=api
ARG VITE_API_URL
ARG VITE_API_STAGING_URL
ARG VITE_API_PRODUCTION_URL

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  # Production
  app-production:
    build:
      context: .
      args:
        VITE_ENVIRONMENT: production
        VITE_DATA_MODE: api
        VITE_API_PRODUCTION_URL: https://api.ninho.app/api
    ports:
      - "80:80"
    restart: unless-stopped

  # Staging
  app-staging:
    build:
      context: .
      args:
        VITE_ENVIRONMENT: staging
        VITE_DATA_MODE: api
        VITE_API_STAGING_URL: https://staging-api.ninho.app/api
    ports:
      - "8080:80"
    restart: unless-stopped
```

## Checklist de Deploy

### Antes do Deploy

- [ ] Testar build localmente com `npm run build:production` ou `npm run build:staging`
- [ ] Verificar se todas as variáveis de ambiente estão configuradas
- [ ] Testar preview do build com `npm run preview:production`
- [ ] Verificar URLs da API (sem trailing slash)
- [ ] Confirmar credenciais do Google OAuth para o domínio correto
- [ ] Validar CORS no backend para o domínio do frontend

### Após o Deploy

- [ ] Verificar se o site carrega corretamente
- [ ] Testar autenticação (se implementada)
- [ ] Verificar chamadas de API no Network tab
- [ ] Testar funcionalidade offline (PWA)
- [ ] Validar tema claro/escuro
- [ ] Testar em dispositivos móveis
- [ ] Monitorar logs de erro
- [ ] Verificar performance (Lighthouse)

## Troubleshooting

### Build falha com erro de variáveis

```bash
# Verifique se as variáveis estão definidas
echo $VITE_ENVIRONMENT
echo $VITE_API_PRODUCTION_URL

# Se estiverem vazias, defina-as antes do build
export VITE_ENVIRONMENT=production
npm run build
```

### API retorna CORS error

Configure CORS no backend para aceitar requisições do domínio do frontend:

```csharp
// Backend ASP.NET Core
app.UseCors(policy => policy
    .WithOrigins("https://ninho.app", "https://staging.ninho.app")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```

### Service Worker não atualiza

Limpe o cache do navegador ou force atualização:
- Chrome: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
- Em produção, incremente a versão do SW em `public/sw.js`

### Variáveis de ambiente não funcionam

Vite só expõe variáveis que começam com `VITE_`. Certifique-se de usar o prefixo correto:

```bash
# ✅ Correto
VITE_API_URL=https://api.ninho.app

# ❌ Errado (não será exposta)
API_URL=https://api.ninho.app
```

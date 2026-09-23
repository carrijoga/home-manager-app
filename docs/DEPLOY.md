# Guia de Implantação (Deploy)

Este guia apresenta instruções passo a passo para a compilação e implantação da aplicação PWA **Ninho** em diferentes plataformas de hospedagem.

---

## 📋 Pré-requisitos de Build

Antes de realizar o deploy, garanta que a aplicação compila sem erros de sintaxe ou de tipos:

```bash
# 1. Verificação de Tipos TypeScript
npm run type-check

# 2. Análise de código com ESLint
npm run lint

# 3. Build de produção local
npm run build
```

O comando `npm run build` executa o compilador TypeScript (`tsc`) e o Vite bundler, gerando os artefatos de distribuição estáticos na pasta `dist/`.

---

## 🚀 Implantação na Vercel (Recomendado)

O projeto contém suporte nativo à plataforma Vercel através do arquivo `vercel.json`.

1. Conecte o repositório do GitHub à sua conta na Vercel.
2. Defina as seguintes configurações de Build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure as **Environment Variables** no painel da Vercel:
   - `VITE_DATA_MODE`: `api` (ou `mock` em builds de demonstração)
   - `VITE_ENVIRONMENT`: `production`
   - `VITE_API_URL`: `https://sua-api.com`
4. Deploy automático a cada push na branch principal (`main`).

---

## 🌐 Implantação na Netlify

1. Crie um novo site a partir do repositório Git na Netlify.
2. Defina as configurações de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Crie um arquivo `public/_redirects` ou garanta o redirecionamento de SPA (reescrevendo `/*` para `/index.html` HTTP 200).
4. Insira as variáveis de ambiente em **Site settings > Environment variables**.

---

## 🐳 Implantação via Docker

Para implantar a aplicação compilada utilizando um servidor web leve como Nginx em container Docker:

### `Dockerfile` (exemplo)
```dockerfile
# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Serving estático com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📱 Verificação de PWA em Produção

Após o deploy:
1. Certifique-se de que o site está servido obrigatoriamente sobre **HTTPS** (exigência para registradores de Service Worker e instalação de PWA).
2. Verifique no DevTools (`Application > Service Workers`) se o Service Worker (`sw.js`) foi registrado com sucesso.
3. Teste o aviso de instalação do PWA e suporte offline.

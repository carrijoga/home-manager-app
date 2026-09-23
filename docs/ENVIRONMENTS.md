# Guia de Ambientes e Configuração

Este documento descreve o sistema de múltiplos ambientes e modos de dados do **Ninho**, detalhando as variáveis de ambiente e comandos para execução.

---

## 🌐 Ambientes Suportados

O projeto suporta três ambientes principais definidos pela variável `VITE_ENVIRONMENT`:

| Ambiente | `VITE_ENVIRONMENT` | Descrição |
| :--- | :--- | :--- |
| **Desenvolvimento** | `development` | Ambiente local de desenvolvimento com hot reloading. |
| **Staging** | `staging` | Ambiente de homologação/testes integrados com backend pré-produção. |
| **Produção** | `production` | Ambiente final de produção otimizado para performance. |

---

## 🔄 Modos de Dados (`VITE_DATA_MODE`)

A camada de serviço do Ninho opera em arquitetura **dual-mode**, alternável sem alteração de código:

### 1. Modo Mock (`mock`)
- **Funcionamento**: Todas as chamadas de serviços consultam o arquivo `src/mocks/data.ts` em memória.
- **Simulação de Latência**: Inclui delay intencional de 100ms para simular resposta assíncrona de rede.
- **Uso**: Ideal para desenvolvimento offline, prototipação de UI e testes visuais sem dependência do backend.

### 2. Modo API (`api`)
- **Funcionamento**: As requisições HTTP são enviadas para a API backend utilizando o cliente unificado `httpClient` (`src/services/api/httpClient.ts`).
- **Autenticação**: Suporta autenticação baseada em cookies (`credentials: 'include'`) com renovação automática de tokens via `/api/auth/refresh` em respostas HTTP 401.
- **SignalR**: Conexão WebSocket em tempo real para sincronização da lista de compras (`useSignalR`).

---

## ⚙️ Variáveis de Ambiente

As variáveis de ambiente devem ser configuradas no arquivo `.env` (baseado em `.env.example`).

```env
# Modo de Dados: 'mock' ou 'api'
VITE_DATA_MODE=mock

# Ambiente da Aplicação: 'development', 'staging' ou 'production'
VITE_ENVIRONMENT=development

# URL Base da API Backend (obrigatório para VITE_DATA_MODE=api)
VITE_API_URL=http://localhost:5026

# URL do Hub SignalR para atualizações em tempo real (opcional)
VITE_SIGNALR_URL=http://localhost:5026/hubs/shopping
```

---

## 🚀 Scripts de Execução por Ambiente

Execute a aplicação com as configurações de cada ambiente utilizando os scripts do `package.json`:

```bash
# Desenvolvimento Local (padrão: .env)
npm run dev

# Staging / Homologação (.env.staging)
npm run dev:staging
npm run build:staging

# Produção (.env.production)
npm run dev:production
npm run build:production
```

# Roadmap do Projeto Ninho

Este documento apresenta o histórico de evolução, funcionalidades implementadas e marcos de planejamento futuro do **Ninho**.

---

## 🚀 Funcionalidades Concluídas

### 🔐 Autenticação & Gestão de Ninhos
- [x] Login com Email/Senha e integração Google OAuth (`/auth/google/callback`).
- [x] Cadastro de novos usuários e perfil de conta.
- [x] Aceite de convites de membros para ninhos familiares via link (`/invite`).
- [x] Troca dinâmica entre múltiplos ninhos cadastrados.

### 📊 Dashboard & Avisos
- [x] Visão geral consolidada da residência com estatísticas e mini-gráficos.
- [x] Quadro de avisos familiar (Post-it interativos com suporte a fixação).
- [x] Carrossel de métricas responsivo e skeleton loaders.
- [x] Busca global unificada de tarefas, compras e finanças.

### ✅ Módulo de Tarefas
- [x] Gerenciamento completo de tarefas domésticas com prioridades (Baixa, Média, Alta).
- [x] Atribuição de responsáveis, categorias e datas de vencimento.
- [x] Visualização em abas (Pendentes e Concluídas) com ordenação e filtros.

### 🛒 Módulo de Lista de Compras
- [x] Organização de itens por categoria com indicadores visuais de progresso.
- [x] Edição em lote (Bulk edit) e estatísticas de orçamento.
- [x] Conexão SignalR para sincronização em tempo real de alterações na lista de compras.

### 💰 Módulo Financeiro (V1 e V2)
- [x] Registro e categorização de despesas e receitas domésticas.
- [x] Gestão de Contas Bancárias (`/financial/account`) e saldo consolidado.
- [x] Gestão de Cartões de Crédito (`/financial/card`) com limite e fechamento de fatura.
- [x] Metas Financeiras (`/financial/goals`) e Recorrências de pagamentos (`/financial/recurrences`).
- [x] Visão Financeiro V2 (`/financial-v2`) com métricas avançadas e dashboards refinados.

### 📦 Compras Futuras & Calendário
- [x] Lista de desejos de compras futuras com estimativa de custos.
- [x] Módulo de Calendário preparado para integração de eventos.

### 🛠️ Infraestrutura & PWA
- [x] Migração dos serviços, schemas, types e contextos para **TypeScript**.
- [x] Cliente HTTP unificado com suporte a refresh token e cookies.
- [x] Suporte a Progressive Web App (PWA) completo com cache via Service Worker (`sw.js`).
- [x] Sistema de temas (Claro / Escuro / Preferência do Sistema).

---

## 🔮 Próximos Passos & Planejamento Futuro

- [ ] Integrar sincronização bidirecional de eventos com o **Google Calendar API**.
- [ ] Implementar notificações Push para lembretes de tarefas e faturas de cartão.
- [ ] Adicionar suporte a fila de sincronização offline (Offline Sync Queue com IndexedDB).
- [ ] Concluir migração dos últimos componentes JSX legados de `src/components/modules/` para TSX.

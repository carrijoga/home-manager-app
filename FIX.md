# 🔧 CORREÇÕES E MELHORIAS - Ninho App

## 📚 Biblioteca de Componentes

### Implementação do shadcn/ui
- **Ação**: Integrar shadcn/ui como biblioteca principal de componentes
- **Motivo**: Componentes acessíveis, customizáveis e bem documentados
- **Componentes prioritários**:
  - Button, Input, Select, Textarea
  - Dialog, Alert, Card
  - Calendar, Popover, DatePicker
  - DropdownMenu, Accordion
  - Separator, Badge, Avatar

### Alternativas consideradas
- Radix UI (base do shadcn)
- Headless UI
- Mantine UI

---

## 🎨 Sistema de Design

### Inputs e Formulários
**Problema atual**: Inputs básicos sem feedback visual adequado

**Melhorias necessárias**:
- ✅ Usar componentes Input do shadcn/ui
- ✅ Adicionar estados visuais claros (focus, error, disabled, success)
- ✅ Incluir labels flutuantes ou fixas conforme contexto
- ✅ Implementar validação visual em tempo real
- ✅ Adicionar ícones contextual (ex: ícone de calendário em campos de data)
- ✅ Placeholder com exemplos reais de uso
- ✅ Mensagens de erro descritivas e bem posicionadas

### Date Picker
**Requisitos**:
- Utilizar componente Calendar do shadcn/ui com Popover
- **Comportamento padrão**: Se nenhuma data for selecionada, usar a data atual automaticamente
- Formato de exibição: DD/MM/YYYY
- Permitir digitação manual ou seleção via calendário
- Destacar visualmente a data de hoje
- Navegação entre meses fluida
- Suporte a atalhos de teclado

**Implementação sugerida**:
```jsx
// Exemplo de comportamento esperado
const [date, setDate] = useState(new Date()); // Default: hoje
```

---

## 🧭 Nova Navegação (Navbar)

### Redesign Completo da Navbar

**Estrutura proposta**:

```
┌─────────────────────────────────────────────────────────────┐
│ 🪺 Ninho    [Links]    [Busca]    [🔔] [👤]                │
└─────────────────────────────────────────────────────────────┘
```

### Elementos obrigatórios:

#### 1. Logo e Nome
- Posição: Extrema esquerda
- Comportamento: Link para Dashboard

#### 2. Links de Navegação
- Manter todos os módulos existentes:
  - Dashboard
  - Tarefas
  - Lista de Compras
  - Financeiro
  - Compras Futuras
  - Calendário
- Destacar visualmente a página ativa
- Hover states bem definidos

#### 3. Busca Global (opcional, mas recomendado)
- Input de busca centralizado
- Atalho de teclado: Ctrl/Cmd + K
- Buscar em todos os módulos

#### 4. **Botão de Notificações** 🔔
- Posição: Direita, antes do perfil
- Badge com contador de notificações não lidas
- Dropdown ao clicar mostrando:
  - Últimas notificações
  - Link "Ver todas"
  - Opção de marcar todas como lidas
- Tipos de notificações:
  - Tarefas vencendo
  - Avisos novos
  - Lembretes de pagamento

#### 5. **Menu de Perfil** 👤
- Posição: Extrema direita
- Avatar do usuário (circular)
- Dropdown com as seguintes opções:
  
  **Estrutura do menu**:
  ```
  ┌─────────────────────────┐
  │ 👤 [Nome do Usuário]    │
  │ [email@exemplo.com]     │
  ├─────────────────────────┤
  │ 👤 Perfil               │
  │ ⚙️  Configurações       │
  │ 🎨 Alterar Tema         │
  │    └─ ☀️ Claro          │
  │    └─ 🌙 Escuro         │
  │    └─ 💻 Sistema        │
  ├─────────────────────────┤
  │ 🚪 Sair                 │
  └─────────────────────────┘
  ```

**Detalhes do Menu de Perfil**:
- **Perfil**: Redireciona para página de edição de perfil
- **Configurações**: Abre página de configurações gerais
- **Alterar Tema**: Submenu ou toggle direto para Dark/Light/Auto
- **Sair**: Realiza logout (com confirmação opcional)

**Recursos adicionais**:
- Status online/offline (bolinha verde/cinza no avatar)
- Animações suaves ao abrir dropdowns
- Fechar ao clicar fora
- Suporte a navegação por teclado

---

## 📊 Dashboard - Redesign Completo

### Cards de Métricas

**Problema atual**: Cards estáticos, pouco informativos

**Solução - Cards Informativos com Comparações**:

#### Estrutura de cada card:
```
┌──────────────────────────────────┐
│ 📊 Nome da Métrica               │
│                                  │
│ R$ 1.234,56        ↑ +15%       │
│ ─────────────────────────────    │
│ vs. mês anterior                 │
│                                  │
│ [Mini gráfico de tendência]      │
└──────────────────────────────────┘
```

#### Cards principais (primeira linha):
1. **Total de Gastos do Mês**
   - Valor atual
   - Comparação com mês anterior (% e ↑↓)
   - Mini gráfico de linha dos últimos 6 meses
   - Cor de alerta se ultrapassar média

2. **Tarefas Concluídas**
   - Quantidade concluídas/total
   - Percentual de conclusão
   - Comparação com mês anterior
   - Barra de progresso visual

3. **Itens a Comprar**
   - Quantidade de itens pendentes
   - Valor estimado total
   - Comparação com lista anterior
   - Categoria com mais itens

4. **Compras Futuras**
   - Quantidade de itens priorizados
   - Valor total estimado
   - Item de maior prioridade destacado

#### Sistema de Carrossel
- **Comportamento**: Cards deslizam automaticamente
- **Controles**: 
  - Setas laterais para navegação manual
  - Indicadores de página (bolinhas)
  - Pausa automática ao hover
- **Cards adicionais**:
  - Economia do mês (comparado ao mês anterior)
  - Categoria com mais gastos
  - Dias até próxima conta vencer
  - Tarefas vencidas (se houver)
  - Média de gastos diários
  - Projeção de gastos do mês (baseado no ritmo atual)

**Bibliotecas sugeridas**:
- **Swiper.js** ou **Embla Carousel** para o carrossel
- **Recharts** para mini gráficos

---

### Quadro de Avisos

**Problemas atuais**:
- Não é possível remover avisos
- Visual pouco atrativo
- Não parece um quadro de avisos real

**Redesign - Estilo Post-it**:

#### Visual:
```
┌─────────────────────────────────────────┐
│  📌 Quadro de Avisos                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │📝 Post1 │  │📝 Post2 │  │📝 Post3 ││
│  │ [texto] │  │ [texto] │  │ [texto] ││
│  │    [×]  │  │    [×]  │  │    [×]  ││
│  └─────────┘  └─────────┘  └─────────┘│
│                                         │
│           [+ Novo Aviso]                │
└─────────────────────────────────────────┘
```

**Especificações**:
- **Cor de fundo dos post-its**: `#FEFCE8` (amarelo bem clarinho, tipo Tailwind yellow-50)
- **Borda**: Sutil, levemente mais escura
- **Sombra**: Leve, simulando papel sobre superfície
- **Cada post-it contém**:
  - Texto do aviso (multi-linha)
  - Data/hora de criação (pequena, no rodapé)
  - Botão [×] para remover (visível apenas ao hover)
  - **Regra**: Só pode remover avisos criados pelo próprio usuário
  
**Comportamento**:
- Layout em grid responsivo (3 colunas em desktop, 2 em tablet, 1 em mobile)
- Animação ao adicionar novo post-it (fade in + slight rotate)
- Animação ao remover (fade out + crumple effect)
- Limite de caracteres por aviso (ex: 200)
- Scroll horizontal se houver muitos avisos

**Melhorias futuras**:
- Arrastar para reordenar
- Cores diferentes por categoria/usuário
- Fixar aviso importante (ícone de alfinete)

---

### Minhas Tarefas

**Problemas atuais**:
- Tamanho desproporcional ao Quadro de Avisos
- Sem separação visual entre pendentes e concluídas
- Não permite criação rápida

**Redesign Completo**:

#### Layout:
```
┌──────────────────────────────────────────┐
│  ✅ Minhas Tarefas          [+ Nova]     │
├──────────────────────────────────────────┤
│                                          │
│  [Input: Digite uma tarefa rápida...]   │
│                                          │
│  ▼ Pendentes (3)                         │
│  ┌────────────────────────────────────┐ │
│  │ ☐ Tarefa 1              [detalhes] │ │
│  │ ☐ Tarefa 2              [detalhes] │ │
│  │ ☐ Tarefa 3              [detalhes] │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ▶ Concluídas (5)                        │
│                                          │
│            Ver mais...                   │
└──────────────────────────────────────────┘
```

**Especificações**:

#### Dimensões:
- **Altura**: Deve acompanhar a altura do "Quadro de Avisos"
- **Largura**: Mesma proporção (lado a lado em desktop)

#### Seções Expansíveis:
1. **Pendentes**:
   - Estado inicial: **Expandida**
   - Mostra checkbox vazio
   - Ordenar por: data de vencimento (mais próxima primeiro)
   
2. **Concluídas**:
   - Estado inicial: **Recolhida**
   - Ao expandir: mostra tarefas com:
     - Checkbox marcado (✓)
     - Fundo levemente apagado/opaco
     - Texto tachado (line-through)
     - Badge verde pequeno: "Concluída"

#### Criação Rápida:
- **Input no topo**: Digite e pressione Enter
- Cria tarefa com:
  - Descrição digitada
  - Data: hoje
  - Responsável: usuário atual
  - Sem hora definida

#### Botão "+ Nova":
- Abre **Dialog** (modal) completo
- Campos do dialog:
  - Descrição (textarea)
  - Data (datepicker)
  - Hora (timepicker opcional)
  - Responsável (select)
  - Prioridade (select: Alta/Média/Baixa)
  - Categoria (select)

#### Comportamento ao Concluir:
- Animação: checkbox marca, item fica verde claro
- Texto fica tachado
- Item move para seção "Concluídas" (com animação)
- **Mesmo comportamento da tela de Tarefas**

#### Limitação de Exibição:
- **Máximo visível**: Primeiras 5 tarefas pendentes
- Se houver mais:
  - Mostrar link "**Ver mais...**" no rodapé
  - Ao clicar: redireciona para `/tarefas`

#### Botão de Detalhes:
- Em cada tarefa, ícone/botão discreto (...)
- Ao clicar: abre popover/dropdown com:
  - Ver detalhes completos
  - Editar
  - Marcar como concluída
  - Excluir

---

## 🛒 Lista de Compras - Refatoração

### Problema Atual:
- Lista única, sem separação por período
- Cards com cor errada (branco ao invés da cor do tema)

### Nova Estrutura - Listas Mensais

**Conceito**: Cada mês possui sua própria lista de compras

#### Interface Proposta:

```
┌─────────────────────────────────────────────┐
│  🛒 Lista de Compras                        │
│                                             │
│  [Dropdown: Selecionar Mês ▼]   [+ Nova]   │
│                                             │
│  ┌─ Outubro 2025 ────────────────────────┐ │
│  │                                        │ │
│  │  📊 Resumo:                            │ │
│  │  • 12 itens (8 comprados, 4 pendentes)│ │
│  │  • Valor total: R$ 457,30              │ │
│  │                                        │ │
│  │  ▼ Alimentos (5)                       │ │
│  │  ☐ Arroz - 5kg - R$ 25,00             │ │
│  │  ☑ Feijão - 1kg - R$ 8,50             │ │
│  │  ...                                   │ │
│  │                                        │ │
│  │  ▼ Limpeza (3)                         │ │
│  │  ...                                   │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Setembro 2025 ──────────────────────┐  │
│  │  [Recolhido - clique para expandir]   │  │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Implementação**:

#### Seletor de Mês:
- Dropdown no topo
- Listar todos os meses com listas criadas
- Opção: "Criar nova lista mensal"
- Mês atual sempre destacado

#### Cards de Lista:
- **Cores**: Usar as cores corretas do tema (primary/secondary conforme Tailwind config)
  - ❌ **Remover**: Fundo branco fixo
  - ✅ **Adicionar**: Classes como `bg-primary-50 dark:bg-primary-900` ou conforme design system
- Cada mês em um card Accordion:
  - Header: Mês/Ano + resumo rápido
  - Expandido: lista completa
  - Mês atual: expandido por padrão
  - Meses anteriores: recolhidos

#### Resumo por Lista:
Cada lista mensal exibe:
- Total de itens
- Itens comprados vs. pendentes
- Valor total estimado
- Categoria com mais itens
- Progresso visual (barra de progresso)

#### Funcionalidades:
- Adicionar item à lista do mês atual
- Marcar item como comprado
- Editar item (abre dialog)
- Remover item
- Arquivar lista do mês (quando concluída)

#### Agrupamento:
- Itens agrupados por categoria
- Cada categoria é expansível
- Contagem de itens por categoria

---

## 💰 Financeiro - Melhorias Completas

### Problemas Atuais:
1. Cards com cor branca fixa (devem respeitar o tema)
2. Não há forma de editar gastos
3. Falta informações sobre pagamento
4. Não há separação entre gastos pagos e não pagos

### Correções e Novas Features:

#### 1. Correção de Cores
- **Remover**: `bg-white` fixo em todos os cards
- **Aplicar**: Classes do tema como `bg-card`, `bg-primary-50`, etc.
- **Dark mode**: Garantir cores apropriadas

#### 2. Sistema de Edição de Gastos

**Botão de Editar**:
- Ícone de lápis/editar em cada gasto
- Ao clicar: abre Dialog de edição

**Dialog de Edição** (mesmos campos do cadastro + novos):

**Campos básicos**:
- Descrição
- Valor
- Categoria
- Data
- Responsável (quem fez o gasto)

**Novos campos**:

- **Parcelamento**:
  - Checkbox: "Foi parcelado?"
  - Se sim:
    - Input: Número de parcelas (ex: 12x)
    - Display: Valor por parcela (calculado automaticamente)
    - Info: "Parcela X de Y"
  
- **Forma de Pagamento**:
  - Select: Dinheiro, Débito, Crédito, PIX, Boleto, Outro
  - Se "Crédito": perguntar se foi parcelado

**Comportamento ao salvar**:
- Atualizar o gasto na lista
- Recalcular totais nos cards
- Atualizar Dashboard automaticamente
- Toast de sucesso: "Gasto atualizado!"

#### 3. Sistema de Pagamento

**Status de Pagamento**:

Cada gasto possui um status:
- ⏳ **Pendente** (não pago)
- ✅ **Pago**

**Interface**:

```
┌─────────────────────────────────────────┐
│ 🍕 Delivery - Restaurante               │
│ R$ 85,00 • Alimentação • 28/10/2025     │
│                                         │
│ Status: ⏳ Pendente                     │
│                                         │
│ [✓ Marcar como Pago]  [✏️ Editar]  [🗑️]│
└─────────────────────────────────────────┘
```

**Ao clicar em "Marcar como Pago"**:
- Abre Dialog:
  
  ```
  ┌─────────────────────────────────┐
  │ Registrar Pagamento             │
  ├─────────────────────────────────┤
  │                                 │
  │ Gasto: Delivery - Restaurante   │
  │ Valor: R$ 85,00                 │
  │                                 │
  │ Forma de Pagamento:             │
  │ [Select: Dinheiro/Débito/...]   │
  │                                 │
  │ Pago por:                       │
  │ [Select: João/Maria/...]        │
  │                                 │
  │ Data do Pagamento:              │
  │ [DatePicker: 30/10/2025]        │
  │                                 │
  │      [Cancelar]  [Confirmar]    │
  └─────────────────────────────────┘
  ```

**Informações registradas**:
- Forma de pagamento
- Quem pagou
- Data do pagamento
- Status: muda para "Pago"

**Edição após pagamento**:
- Permitir editar forma de pagamento
- Permitir alterar quem pagou
- Permitir reverter status (marcar como não pago)

#### 4. Seções Separadas

**Nova estrutura da página**:

```
┌────────────────────────────────────────┐
│ 💰 Financeiro                          │
│                                        │
│ [Cards de Resumo]                      │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ ▼ Gastos Pendentes (5)  [+ Novo]      │
│ ┌──────────────────────────────────┐  │
│ │ [Lista de gastos não pagos]      │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ▼ Gastos Pagos (12)                   │
│ ┌──────────────────────────────────┐  │
│ │ 🍕 Delivery • R$ 85,00            │  │
│ │ ✅ Pago via PIX por João          │  │
│ │ 📅 28/10/2025                     │  │
│ │ ────────────────────────────────  │  │
│ │ [mais gastos...]                  │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Seção "Gastos Pendentes"**:
- Lista todos os gastos não pagos
- Ordenados por data (mais antigos primeiro)
- Destaque para gastos vencidos (se houver data de vencimento)
- Ações: Editar, Marcar como Pago, Excluir

**Seção "Gastos Pagos"** (nova):
- Lista todos os gastos já pagos
- Mostrar informações de pagamento:
  - ✅ Badge "Pago"
  - Forma de pagamento (ícone + texto)
  - Quem pagou
  - Data do pagamento
- Ações: Ver detalhes, Editar pagamento, Excluir
- Filtros:
  - Por forma de pagamento
  - Por pessoa que pagou
  - Por período

**Funcionalidades de Filtro**:
- Filtrar por categoria
- Filtrar por responsável
- Filtrar por forma de pagamento
- Filtrar por período
- Busca por descrição

---

## 🎯 Compras Futuras - Melhorias

### Problemas Atuais:
1. Cards com cor branca (mesmo problema)
2. Não há como editar compras
3. Não há integração com Financeiro

### Correções:

#### 1. Correção de Cores
- Aplicar as mesmas correções de tema do Financeiro

#### 2. Sistema de Edição

**Botão de Editar**:
- Ícone de lápis em cada item
- Ao clicar: abre Dialog de edição

**Dialog de Edição**:
- Mesmos campos do cadastro:
  - Nome do item
  - Descrição
  - Valor estimado
  - Prioridade (Alta/Média/Baixa)
  - Categoria
  - Link (opcional)
  - Notas

**Comportamento**:
- Salvar: atualiza item na lista
- Toast de sucesso

#### 3. Converter em Gasto Real

**Nova feature**: Botão "Comprar Agora"

**Interface**:
```
┌─────────────────────────────────────┐
│ 💻 Notebook Dell                    │
│ R$ 3.500,00 • 🔴 Alta               │
│                                     │
│ [✏️ Editar]  [🛒 Comprar]  [🗑️]    │
└─────────────────────────────────────┘
```

**Ao clicar em "Comprar"**:
- Abre Dialog de criação de gasto
- Campos **pré-preenchidos**:
  - Descrição: nome do item da compra futura
  - Valor: valor estimado (editável)
  - Categoria: mesma categoria
  - Data: hoje (editável)
- Campos **adicionais** (vazios):
  - Forma de pagamento
  - Parcelamento
  - Responsável pelo gasto
  - Observações

**Comportamento ao salvar**:
1. Cria novo gasto no módulo Financeiro
2. **Opções**:
   - Remover item de Compras Futuras
   - Marcar item como "Comprado" (manter na lista com badge)
3. Mostrar toast: "Gasto criado com sucesso!"
4. Botão no toast: "Ver gasto" (redireciona ao Financeiro)

**Estados do item**:
- 🔴 **Planejado** (status padrão)
- ✅ **Comprado** (após criar gasto)
  - Mostrar data da compra
  - Link para o gasto no Financeiro
  - Diferença: valor real vs. valor estimado

---

## 🎨 Melhorias de UX/UI Gerais

### Feedback Visual
- Toast notifications para todas as ações (sucesso, erro, aviso)
- Loading states em botões
- Skeleton loaders ao carregar dados
- Animações suaves (framer-motion)

### Consistência
- Todos os dialogs com mesma estrutura
- Botões com mesmos padrões (primário, secundário, danger)
- Espaçamentos consistentes
- Tipografia padronizada

### Acessibilidade
- Labels em todos os inputs
- Atalhos de teclado
- Foco visível
- Mensagens de erro descritivas
- Contrast ratio adequado

### Responsividade
- Testar todos os breakpoints
- Mobile-first approach
- Touch targets adequados (mínimo 44x44px)
- Gestos touch (swipe, long press)

---

## 📋 Checklist de Implementação

### Fase 1 - Fundação (Semana 1)
- [ ] Instalar e configurar shadcn/ui
- [ ] Criar componentes base (Button, Input, etc.)
- [ ] Implementar DatePicker com comportamento padrão
- [ ] Redesenhar Navbar completa
- [ ] Sistema de notificações (estrutura básica)
- [ ] Menu de perfil com alteração de tema

### Fase 2 - Dashboard (Semana 2)
- [ ] Redesign dos cards com comparações
- [ ] Implementar sistema de carrossel
- [ ] Mini gráficos de tendência (Recharts)
- [ ] Refatorar Quadro de Avisos (post-its)
- [ ] Funcionalidade de remover avisos
- [ ] Redesign seção "Minhas Tarefas"
- [ ] Criação rápida de tarefas
- [ ] Seções expansíveis (Pendentes/Concluídas)

### Fase 3 - Módulos Principais (Semana 3-4)
- [ ] Lista de Compras: sistema mensal
- [ ] Correção de cores em todos os cards
- [ ] Financeiro: dialog de edição
- [ ] Sistema de parcelamento
- [ ] Status de pagamento
- [ ] Seção de gastos pagos
- [ ] Compras Futuras: dialog de edição
- [ ] Funcionalidade "Criar Gasto"

### Fase 4 - Polimento (Semana 5)
- [ ] Toast notifications em todas as ações
- [ ] Animações e transições
- [ ] Teste de responsividade completo
- [ ] Revisão de acessibilidade
- [ ] Documentação de componentes
- [ ] Testes E2E básicos

---

## 🚀 Comandos para Iniciar

### Instalar shadcn/ui:
```bash
npx shadcn-ui@latest init
```

### Adicionar componentes essenciais:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add select
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add toast
```

### Instalar dependências adicionais:
```bash
npm install recharts swiper date-fns
npm install framer-motion # se ainda não instalado
npm install react-hot-toast # para toast notifications
```
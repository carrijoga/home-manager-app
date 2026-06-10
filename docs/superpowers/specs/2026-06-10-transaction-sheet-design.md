# TransactionSheet — Design Spec
**Data:** 2026-06-10  
**Status:** Aprovado  
**Substitui:** `src/components/modals/TransactionFormModal.tsx`

---

## Objetivo

Refazer o modal de criação/edição de transação financeira como um bottom sheet com identidade visual distinta entre Despesa e Receita, melhorando a experiência de lançamento para o usuário.

---

## Decisões de Design

| Decisão | Escolha |
|---|---|
| Tipo de overlay | Bottom Sheet (`Sheet side="bottom"`) |
| Seleção de tipo | Toggle no topo do formulário |
| Distinção entre tipos | Formulários distintos + cor + linguagem |
| Campo de valor | Hero em tipografia grande, no topo |
| Campos opcionais | Seção "Mais detalhes" colapsável |
| Animação | Transição animada ao trocar Despesa ↔ Receita |
| Paleta | Rose & Sage — muted, sofisticado |

---

## Identidade Visual por Tipo

| Token | Despesa | Receita |
|---|---|---|
| Cor primária | `#e07070` (Rose muted) | `#6ab085` (Sage green) |
| Bg sutil (12% opacity) | `#e0707020` | `#6ab08520` |
| Label do hero | "Valor da despesa" | "Valor recebido" |
| Placeholder descrição | "Ex.: Conta de luz" | "Ex.: Salário de junho" |
| Label do CTA | "Registrar despesa" | "Registrar receita" |
| Emoji do toggle | 💸 Despesa | 📈 Receita |

---

## Campos por Tipo

### Sempre visíveis (obrigatórios)
- Valor (hero — tipografia grande, full-width)
- Descrição (full-width, abaixo do valor)
- Data (grid 2 colunas, lado esquerdo)
- Categoria (grid 2 colunas, lado direito — filtrada por tipo)
- Responsável (full-width)

### Seção "Mais detalhes" — Despesa
- Vencimento (date input)
- Método de pagamento (select — enum `ApiPaymentMethod`: Dinheiro, Débito, Crédito, PIX, Boleto, Outro)
- Observação (textarea)

### Seção "Mais detalhes" — Receita
- Fonte da receita (input texto livre — UI-only, não vai no payload)
- Observação (textarea)

> **Nota:** `paymentMethod` e `incomeSource` são estado de UI por ora. O `CreateTransactionRequest` não inclui esses campos. Quando o backend suportar, basta adicioná-los ao payload em `handleSubmit`.

---

## Arquitetura de Componentes

```
src/components/modals/
  TransactionSheet.tsx              ← componente raiz (substitui TransactionFormModal)
  transaction-sheet/
    TypeToggle.tsx                  ← toggle Despesa / Receita
    AmountHero.tsx                  ← valor grande + campo descrição
    ExpenseFields.tsx               ← campos específicos de despesa
    IncomeFields.tsx                ← campos específicos de receita
    MoreDetails.tsx                 ← seção colapsável com campos opcionais
```

O arquivo `TransactionFormModal.tsx` é deletado. O novo `TransactionSheet` exporta a mesma interface de props — os chamadores só trocam o nome do import.

---

## Interface de Props

Idêntica ao `TransactionFormModal` atual:

```ts
interface TransactionSheetProps {
  open: boolean;
  onClose: () => void;
  transaction: FinancialTransactionResponse | null; // null = criação; preenchida = edição
  categories: CategoryResponse[];
  nestId: string | undefined;
  currentUserId: string;
  onCreate: (payload: CreateTransactionRequest) => Promise<void>;
  onUpdate: (payload: UpdateTransactionRequest) => Promise<void>;
}
```

---

## Estado Interno

```ts
// Campos comuns
type: TransactionType          // Expense | Income
description: string
amount: number | null
transactionDate: string        // ISO date (YYYY-MM-DD)
categoryId: string
responsibleUserId: string
observation: string
isDetailsOpen: boolean         // controla seção "Mais detalhes"
isSubmitting: boolean
members: NestMember[]

// Extras — Despesa
dueDate: string                // ISO date
paymentMethod: ApiPaymentMethod | null  // UI-only

// Extras — Receita
incomeSource: string           // UI-only
```

Ao trocar `type`: `categoryId` é resetado, campos extras do tipo anterior são limpos.

---

## Animações (Framer Motion)

Todas as animações respeitam `usePrefersReducedMotion()` — duração zero quando ativado.

| Elemento | Animação |
|---|---|
| `TypeToggle` — botão ativo | `backgroundColor` animado via `motion.div` ao trocar tipo |
| `AmountHero` — cor do valor | `color` cross-fade entre `#e07070` e `#6ab085` em 200ms |
| `ExpenseFields` / `IncomeFields` | `AnimatePresence mode="wait"` — saída: `opacity:0, y:-8`; entrada: `opacity:1, y:0` em 220ms |
| `MoreDetails` — expandir/colapsar | `AnimatePresence` + `motion.div` com `height` animado (0 → auto) |

---

## Validação de Submit

```ts
const isValid =
  description.trim().length > 0 &&
  amount !== null && amount > 0 &&
  Boolean(categoryId) &&
  Boolean(responsibleUserId) &&
  members.length > 0
```

Mesma lógica atual — botão de submit desabilitado enquanto inválido ou submetendo.

---

## Modo Edição

Quando `transaction !== null`:
- Campos pré-preenchidos a partir de `transaction` (incluindo `dueDate` e `paymentMethod` para despesas)
- CTA muda para "Salvar alterações"
- `onUpdate` é chamado no submit com `financialTransactionId`
- Seção "Mais detalhes" abre automaticamente se algum campo opcional estiver preenchido
- Campo "Observação" sempre visível dentro de "Mais detalhes" (expandido por padrão no modo edição)

---

## Compatibilidade

- **Chamadores:** buscar todos os usos de `TransactionFormModal` e substituir por `TransactionSheet`
- **Payload:** `CreateTransactionRequest` e `UpdateTransactionRequest` não mudam
- **Serviços:** nenhuma alteração necessária
- **`Sheet` UI:** já existe em `src/components/ui/sheet.tsx`, exportado de `src/components/ui/index.ts`

---

## Fora de Escopo

- Integração de método de pagamento no payload (backend não suporta ainda)
- Integração de fonte de receita no payload (backend não suporta ainda)
- Anexos / comprovantes
- Recorrência de transações

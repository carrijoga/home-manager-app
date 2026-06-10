# TransactionSheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o `TransactionFormModal` por um bottom sheet (`TransactionSheet`) com identidade visual distinta por tipo (Despesa/Receita), valor em destaque, animação de transição entre tipos, e campos específicos por tipo.

**Architecture:** O componente raiz `TransactionSheet` orquestra 5 sub-componentes em `src/components/modals/transaction-sheet/`. O Sheet usa o primitivo `Sheet side="bottom"` já existente em `src/components/ui/sheet.tsx`. Animações usam Framer Motion com `AnimatePresence` e `usePrefersReducedMotion`.

**Tech Stack:** React 18, TypeScript, Framer Motion, Radix UI Sheet, Tailwind CSS, shadcn/ui

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/components/modals/TransactionSheet.tsx` | Criar | Componente raiz — orquestra estado, sub-componentes, submit |
| `src/components/modals/transaction-sheet/TypeToggle.tsx` | Criar | Toggle animado Despesa/Receita |
| `src/components/modals/transaction-sheet/AmountHero.tsx` | Criar | Campo valor em tipografia grande + descrição |
| `src/components/modals/transaction-sheet/ExpenseFields.tsx` | Criar | Campos específicos de despesa (data, categoria, responsável + mais detalhes) |
| `src/components/modals/transaction-sheet/IncomeFields.tsx` | Criar | Campos específicos de receita (data, categoria, responsável + mais detalhes) |
| `src/components/modals/transaction-sheet/MoreDetails.tsx` | Criar | Seção colapsável animada com campos opcionais |
| `src/components/modules/Financial.tsx` | Modificar | Trocar import/uso de `TransactionFormModal` → `TransactionSheet` |
| `src/components/modals/TransactionFormModal.tsx` | Deletar | Substituído por `TransactionSheet` |

---

## Task 1: TypeToggle

**Files:**
- Create: `src/components/modals/transaction-sheet/TypeToggle.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/modals/transaction-sheet/TypeToggle.tsx
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';

interface TypeToggleProps {
  value: number;
  onChange: (type: number) => void;
}

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const reduced = usePrefersReducedMotion();
  const isExpense = value === TransactionType.Expense;

  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1"
      role="radiogroup"
      aria-label="Tipo de transação"
      onKeyDown={e => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          onChange(isExpense ? TransactionType.Income : TransactionType.Expense);
        }
      }}
    >
      {[
        { v: TransactionType.Expense, label: '💸 Despesa', color: EXPENSE_COLOR },
        { v: TransactionType.Income, label: '📈 Receita', color: INCOME_COLOR },
      ].map(opt => {
        const active = value === opt.v;
        return (
          <motion.button
            key={opt.v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.v)}
            animate={active ? { backgroundColor: opt.color, color: '#ffffff' } : { backgroundColor: 'transparent', color: '#6b7280' }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="rounded-lg py-2.5 text-sm font-semibold"
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -20
```

Esperado: sem erros em `TypeToggle.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/transaction-sheet/TypeToggle.tsx
git commit -m "feat(transaction-sheet): add TypeToggle component"
```

---

## Task 2: AmountHero

**Files:**
- Create: `src/components/modals/transaction-sheet/AmountHero.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/modals/transaction-sheet/AmountHero.tsx
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';
import MoneyInput from '@/components/common/MoneyInput';
import { Input, Label } from '@/components/ui';

interface AmountHeroProps {
  type: number;
  amount: number | null;
  onAmountChange: (v: number | null) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
}

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function AmountHero({ type, amount, onAmountChange, description, onDescriptionChange }: AmountHeroProps) {
  const reduced = usePrefersReducedMotion();
  const isExpense = type === TransactionType.Expense;
  const color = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
  const label = isExpense ? 'Valor da despesa' : 'Valor recebido';
  const placeholder = isExpense ? 'Ex.: Conta de luz' : 'Ex.: Salário de junho';

  return (
    <div className="px-1 py-4 text-center border-b border-border/40">
      <motion.p
        animate={{ color }}
        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        className="text-[10px] uppercase tracking-widest mb-2 font-semibold"
      >
        {label}
      </motion.p>

      <motion.div
        animate={{ color }}
        transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        className="text-5xl font-extrabold tracking-tighter mb-4 [&_input]:text-center [&_input]:text-5xl [&_input]:font-extrabold [&_input]:tracking-tighter [&_input]:border-none [&_input]:bg-transparent [&_input]:shadow-none [&_input]:p-0 [&_input]:h-auto [&_input]:focus-visible:ring-0"
        style={{ color }}
      >
        <MoneyInput
          id="tx-amount"
          value={amount}
          onChange={onAmountChange}
          placeholder="R$ 0,00"
          autoFocus
        />
      </motion.div>

      <div className="text-left">
        <Label htmlFor="tx-description" className="sr-only">Descrição</Label>
        <Input
          id="tx-description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={placeholder}
          className="bg-muted/30 border-border/40 text-sm"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -20
```

Esperado: sem erros em `AmountHero.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/transaction-sheet/AmountHero.tsx
git commit -m "feat(transaction-sheet): add AmountHero component"
```

---

## Task 3: MoreDetails

**Files:**
- Create: `src/components/modals/transaction-sheet/MoreDetails.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/modals/transaction-sheet/MoreDetails.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface MoreDetailsProps {
  isOpen: boolean;
  onToggle: () => void;
  hint: string;
  children: React.ReactNode;
}

export function MoreDetails({ isOpen, onToggle, hint, children }: MoreDetailsProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="border border-dashed border-border/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div>
          <span className="text-sm text-muted-foreground font-medium">Mais detalhes</span>
          {!isOpen && (
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">{hint}</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-muted-foreground/50" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="details"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -20
```

Esperado: sem erros em `MoreDetails.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/transaction-sheet/MoreDetails.tsx
git commit -m "feat(transaction-sheet): add MoreDetails collapsible component"
```

---

## Task 4: ExpenseFields

**Files:**
- Create: `src/components/modals/transaction-sheet/ExpenseFields.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/modals/transaction-sheet/ExpenseFields.tsx
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';
import { ApiPaymentMethod } from '@/schemas/enums';
import type { CategoryResponse } from '@/schemas/category';
import type { NestMember } from '@/schemas/nest';
import { MoreDetails } from './MoreDetails';

interface ExpenseFieldsProps {
  categoryId: string;
  onCategoryChange: (v: string) => void;
  transactionDate: string;
  onDateChange: (v: string) => void;
  responsibleUserId: string;
  onResponsibleChange: (v: string) => void;
  dueDate: string;
  onDueDateChange: (v: string) => void;
  paymentMethod: number | null;
  onPaymentMethodChange: (v: number | null) => void;
  observation: string;
  onObservationChange: (v: string) => void;
  isDetailsOpen: boolean;
  onDetailsToggle: () => void;
  categories: CategoryResponse[];
  members: NestMember[];
  isEdit: boolean;
}

const PAYMENT_METHOD_LABELS: Record<number, string> = {
  [ApiPaymentMethod.Cash]: 'Dinheiro',
  [ApiPaymentMethod.Debit]: 'Débito',
  [ApiPaymentMethod.Credit]: 'Crédito',
  [ApiPaymentMethod.Pix]: 'PIX',
  [ApiPaymentMethod.Boleto]: 'Boleto',
  [ApiPaymentMethod.Other]: 'Outro',
};

export function ExpenseFields({
  categoryId, onCategoryChange,
  transactionDate, onDateChange,
  responsibleUserId, onResponsibleChange,
  dueDate, onDueDateChange,
  paymentMethod, onPaymentMethodChange,
  observation, onObservationChange,
  isDetailsOpen, onDetailsToggle,
  categories, members, isEdit,
}: ExpenseFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tx-date" className="text-xs text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="tx-date" type="date" value={transactionDate} onChange={e => onDateChange(e.target.value)} className="bg-muted/30 border-border/40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-category" className="text-xs text-muted-foreground uppercase tracking-wide">Categoria</Label>
          <Select value={categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger id="tx-category" className="bg-muted/30 border-border/40">
              <SelectValue placeholder="Selecionar…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.categoryId} value={c.categoryId}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-responsible" className="text-xs text-muted-foreground uppercase tracking-wide">Responsável</Label>
        <Select value={responsibleUserId} onValueChange={onResponsibleChange}>
          <SelectTrigger id="tx-responsible" className="bg-muted/30 border-border/40">
            <SelectValue placeholder="Selecionar…" />
          </SelectTrigger>
          <SelectContent>
            {members.map(m => (
              <SelectItem key={m.userId} value={m.userId}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MoreDetails
        isOpen={isDetailsOpen || isEdit}
        onToggle={onDetailsToggle}
        hint="vencimento · método de pgto. · observação"
      >
        <div className="space-y-1.5">
          <Label htmlFor="tx-due" className="text-xs text-muted-foreground uppercase tracking-wide">Vencimento</Label>
          <Input id="tx-due" type="date" value={dueDate} onChange={e => onDueDateChange(e.target.value)} className="bg-muted/30 border-border/40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-method" className="text-xs text-muted-foreground uppercase tracking-wide">Método de pagamento</Label>
          <Select
            value={paymentMethod !== null ? String(paymentMethod) : ''}
            onValueChange={v => onPaymentMethodChange(v ? Number(v) : null)}
          >
            <SelectTrigger id="tx-method" className="bg-muted/30 border-border/40">
              <SelectValue placeholder="Selecionar…" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-obs-expense" className="text-xs text-muted-foreground uppercase tracking-wide">Observação</Label>
          <Textarea id="tx-obs-expense" rows={2} value={observation} onChange={e => onObservationChange(e.target.value)} placeholder="Opcional" className="bg-muted/30 border-border/40 resize-none" />
        </div>
      </MoreDetails>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -20
```

Esperado: sem erros em `ExpenseFields.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/transaction-sheet/ExpenseFields.tsx
git commit -m "feat(transaction-sheet): add ExpenseFields component"
```

---

## Task 5: IncomeFields

**Files:**
- Create: `src/components/modals/transaction-sheet/IncomeFields.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/modals/transaction-sheet/IncomeFields.tsx
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';
import type { CategoryResponse } from '@/schemas/category';
import type { NestMember } from '@/schemas/nest';
import { MoreDetails } from './MoreDetails';

interface IncomeFieldsProps {
  categoryId: string;
  onCategoryChange: (v: string) => void;
  transactionDate: string;
  onDateChange: (v: string) => void;
  responsibleUserId: string;
  onResponsibleChange: (v: string) => void;
  incomeSource: string;
  onIncomeSourceChange: (v: string) => void;
  observation: string;
  onObservationChange: (v: string) => void;
  isDetailsOpen: boolean;
  onDetailsToggle: () => void;
  categories: CategoryResponse[];
  members: NestMember[];
  isEdit: boolean;
}

export function IncomeFields({
  categoryId, onCategoryChange,
  transactionDate, onDateChange,
  responsibleUserId, onResponsibleChange,
  incomeSource, onIncomeSourceChange,
  observation, onObservationChange,
  isDetailsOpen, onDetailsToggle,
  categories, members, isEdit,
}: IncomeFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tx-date-income" className="text-xs text-muted-foreground uppercase tracking-wide">Data</Label>
          <Input id="tx-date-income" type="date" value={transactionDate} onChange={e => onDateChange(e.target.value)} className="bg-muted/30 border-border/40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-category-income" className="text-xs text-muted-foreground uppercase tracking-wide">Categoria</Label>
          <Select value={categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger id="tx-category-income" className="bg-muted/30 border-border/40">
              <SelectValue placeholder="Selecionar…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.categoryId} value={c.categoryId}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-responsible-income" className="text-xs text-muted-foreground uppercase tracking-wide">Responsável</Label>
        <Select value={responsibleUserId} onValueChange={onResponsibleChange}>
          <SelectTrigger id="tx-responsible-income" className="bg-muted/30 border-border/40">
            <SelectValue placeholder="Selecionar…" />
          </SelectTrigger>
          <SelectContent>
            {members.map(m => (
              <SelectItem key={m.userId} value={m.userId}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MoreDetails
        isOpen={isDetailsOpen || isEdit}
        onToggle={onDetailsToggle}
        hint="fonte da receita · observação"
      >
        <div className="space-y-1.5">
          <Label htmlFor="tx-source" className="text-xs text-muted-foreground uppercase tracking-wide">Fonte da receita</Label>
          <Input id="tx-source" value={incomeSource} onChange={e => onIncomeSourceChange(e.target.value)} placeholder="Ex.: Salário, Freelance…" className="bg-muted/30 border-border/40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-obs-income" className="text-xs text-muted-foreground uppercase tracking-wide">Observação</Label>
          <Textarea id="tx-obs-income" rows={2} value={observation} onChange={e => onObservationChange(e.target.value)} placeholder="Opcional" className="bg-muted/30 border-border/40 resize-none" />
        </div>
      </MoreDetails>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -20
```

Esperado: sem erros em `IncomeFields.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/transaction-sheet/IncomeFields.tsx
git commit -m "feat(transaction-sheet): add IncomeFields component"
```

---

## Task 6: TransactionSheet (componente raiz)

**Files:**
- Create: `src/components/modals/TransactionSheet.tsx`

- [ ] **Step 1: Criar o componente raiz**

```tsx
// src/components/modals/TransactionSheet.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Button, Sheet, SheetContent } from '@/components/ui';
import type { CategoryResponse } from '@/schemas/category';
import { FinancialSourceType, TransactionType } from '@/schemas/enums';
import type {
  CreateTransactionRequest,
  FinancialTransactionResponse,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
import * as nestService from '@/services/nestService';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import { AmountHero } from './transaction-sheet/AmountHero';
import { ExpenseFields } from './transaction-sheet/ExpenseFields';
import { IncomeFields } from './transaction-sheet/IncomeFields';
import { TypeToggle } from './transaction-sheet/TypeToggle';

export interface TransactionSheetProps {
  open: boolean;
  onClose: () => void;
  transaction: FinancialTransactionResponse | null;
  categories: CategoryResponse[];
  nestId: string | undefined;
  currentUserId: string;
  onCreate: (payload: CreateTransactionRequest) => Promise<void>;
  onUpdate: (payload: UpdateTransactionRequest) => Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const toApiDateTime = (isoDate: string) => new Date(`${isoDate}T12:00:00`).toISOString();

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function TransactionSheet({
  open, onClose, transaction, categories, nestId, currentUserId, onCreate, onUpdate,
}: TransactionSheetProps) {
  const isEdit = transaction !== null;
  const reduced = usePrefersReducedMotion();

  const [type, setType] = useState<number>(TransactionType.Expense);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [transactionDate, setTransactionDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState(currentUserId);
  const [observation, setObservation] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<NestMember[]>([]);

  // Expense extras
  const [dueDate, setDueDate] = useState(todayIso());
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);

  // Income extras
  const [incomeSource, setIncomeSource] = useState('');

  useEffect(() => {
    if (!nestId) return;
    let active = true;
    nestService.getNestMembers(nestId)
      .then(m => { if (active) setMembers(m); })
      .catch(() => {});
    return () => { active = false; };
  }, [nestId]);

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setType(transaction.transactionType);
      setDescription(transaction.description);
      setAmount(Number(transaction.value));
      setTransactionDate(String(transaction.transactionDate).slice(0, 10));
      setCategoryId(transaction.categoryId);
      setResponsibleUserId(transaction.responsibleUserId);
      setObservation(transaction.observation ?? '');
      setDueDate(String(transaction.dueDate).slice(0, 10));
      setPaymentMethod(null);
      setIncomeSource('');
      setIsDetailsOpen(true);
    } else {
      setType(TransactionType.Expense);
      setDescription('');
      setAmount(null);
      setTransactionDate(todayIso());
      setCategoryId('');
      setResponsibleUserId(currentUserId);
      setObservation('');
      setDueDate(todayIso());
      setPaymentMethod(null);
      setIncomeSource('');
      setIsDetailsOpen(false);
    }
  }, [open, transaction, currentUserId]);

  const handleTypeChange = (newType: number) => {
    setType(newType);
    setCategoryId('');
    setDueDate(todayIso());
    setPaymentMethod(null);
    setIncomeSource('');
    setIsDetailsOpen(false);
  };

  const visibleCategories = categories.filter(c => c.type === type);

  const isValid =
    description.trim().length > 0 &&
    amount !== null && amount > 0 &&
    Boolean(categoryId) &&
    Boolean(responsibleUserId) &&
    members.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const base = {
        type,
        description: description.trim(),
        amount: amount as number,
        transactionDate: toApiDateTime(transactionDate),
        dueDate: toApiDateTime(dueDate),
        categoryId,
        responsibleUserId,
        sourceType: FinancialSourceType.Manual,
      };
      if (isEdit && transaction) {
        await onUpdate({
          ...base,
          financialTransactionId: transaction.financialTransactionId,
          observation: observation.trim() || null,
        });
      } else {
        await onCreate(base);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpense = type === TransactionType.Expense;
  const submitColor = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
  const submitLabel = isSubmitting
    ? 'Salvando…'
    : isEdit
      ? 'Salvar alterações'
      : isExpense ? 'Registrar despesa' : 'Registrar receita';

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-4 pb-6 pt-3 max-h-[92dvh] overflow-y-auto focus:outline-none"
      >
        {/* Handle */}
        <div className="w-9 h-1 rounded-full bg-border mx-auto mb-4" aria-hidden />

        <form onSubmit={e => { void handleSubmit(e).catch(() => {}); }} className="space-y-4">
          <TypeToggle value={type} onChange={handleTypeChange} />

          <AmountHero
            type={type}
            amount={amount}
            onAmountChange={setAmount}
            description={description}
            onDescriptionChange={setDescription}
          />

          <AnimatePresence mode="wait">
            {isExpense ? (
              <motion.div
                key="expense"
                initial={reduced ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={reduced ? { duration: 0 } : { duration: 0.22 }}
              >
                <ExpenseFields
                  categoryId={categoryId}
                  onCategoryChange={setCategoryId}
                  transactionDate={transactionDate}
                  onDateChange={setTransactionDate}
                  responsibleUserId={responsibleUserId}
                  onResponsibleChange={setResponsibleUserId}
                  dueDate={dueDate}
                  onDueDateChange={setDueDate}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  observation={observation}
                  onObservationChange={setObservation}
                  isDetailsOpen={isDetailsOpen}
                  onDetailsToggle={() => setIsDetailsOpen(v => !v)}
                  categories={visibleCategories}
                  members={members}
                  isEdit={isEdit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="income"
                initial={reduced ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={reduced ? { duration: 0 } : { duration: 0.22 }}
              >
                <IncomeFields
                  categoryId={categoryId}
                  onCategoryChange={setCategoryId}
                  transactionDate={transactionDate}
                  onDateChange={setTransactionDate}
                  responsibleUserId={responsibleUserId}
                  onResponsibleChange={setResponsibleUserId}
                  incomeSource={incomeSource}
                  onIncomeSourceChange={setIncomeSource}
                  observation={observation}
                  onObservationChange={setObservation}
                  isDetailsOpen={isDetailsOpen}
                  onDetailsToggle={() => setIsDetailsOpen(v => !v)}
                  categories={visibleCategories}
                  members={members}
                  isEdit={isEdit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ backgroundColor: submitColor }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="rounded-xl overflow-hidden"
          >
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full font-semibold text-white bg-transparent hover:bg-black/10 disabled:opacity-50"
            >
              {submitLabel}
            </Button>
          </motion.div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -30
```

Esperado: sem erros nos novos arquivos.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/TransactionSheet.tsx
git commit -m "feat(transaction-sheet): add TransactionSheet root component"
```

---

## Task 7: Integrar em Financial.tsx e remover modal antigo

**Files:**
- Modify: `src/components/modules/Financial.tsx`
- Delete: `src/components/modals/TransactionFormModal.tsx`

- [ ] **Step 1: Substituir import em Financial.tsx**

Em `src/components/modules/Financial.tsx`, linha 7, trocar:

```tsx
import { TransactionFormModal } from '@/components/modals/TransactionFormModal';
```

por:

```tsx
import { TransactionSheet } from '@/components/modals/TransactionSheet';
```

- [ ] **Step 2: Substituir o componente no JSX**

Em `src/components/modules/Financial.tsx`, linha 304, trocar:

```tsx
      <TransactionFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTx(null); }}
        transaction={editingTx}
        categories={categories}
        nestId={nestId}
        currentUserId={currentUserId}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
```

por:

```tsx
      <TransactionSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTx(null); }}
        transaction={editingTx}
        categories={categories}
        nestId={nestId}
        currentUserId={currentUserId}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
```

- [ ] **Step 3: Deletar o arquivo antigo**

```bash
rm "C:/Users/VIBE/source/repos/carrijoga/home-manager-app/src/components/modals/TransactionFormModal.tsx"
```

- [ ] **Step 4: Verificar tipos e lint**

```bash
cd "C:/Users/VIBE/source/repos/carrijoga/home-manager-app" && npm run type-check 2>&1 | tail -20
```

Esperado: zero erros.

- [ ] **Step 5: Commit final**

```bash
git add src/components/modules/Financial.tsx
git rm src/components/modals/TransactionFormModal.tsx
git commit -m "feat(financial): replace TransactionFormModal with TransactionSheet"
```

---

## Self-Review

**Cobertura do spec:**
- ✅ Bottom sheet (`Sheet side="bottom"`) — Task 6
- ✅ Toggle Despesa/Receita animado — Task 1
- ✅ Valor em hero (tipografia grande) — Task 2
- ✅ Campos específicos por tipo — Tasks 4 e 5
- ✅ Seção "Mais detalhes" colapsável animada — Task 3
- ✅ Animação de transição `AnimatePresence mode="wait"` — Task 6
- ✅ Paleta Rose & Sage (`#e07070` / `#6ab085`) — Tasks 1, 2, 6
- ✅ `usePrefersReducedMotion` em todas as animações — Tasks 1, 2, 3, 6
- ✅ Modo edição com `isDetailsOpen=true` — Tasks 4, 5, 6
- ✅ Mesma interface de props — Task 6
- ✅ Substituição do chamador — Task 7
- ✅ Deleção do arquivo antigo — Task 7

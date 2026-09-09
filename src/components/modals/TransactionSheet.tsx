// src/components/modals/TransactionSheet.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Sheet, SheetContent } from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type { BankAccountResponse } from '@/schemas/bank-account';
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';
import type {
  CreateTransactionRequest,
  FinancialTransactionResponse,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
import * as bankAccountService from '@/services/bankAccountService';
import * as nestService from '@/services/nestService';

import { AmountHero } from './transaction-sheet/AmountHero';
import { ExpenseFields } from './transaction-sheet/ExpenseFields';
import { IncomeFields } from './transaction-sheet/IncomeFields';
import { TypeToggle } from './transaction-sheet/TypeToggle';

export interface TransactionSheetProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryResponse[];
  nestId: string | undefined;
  currentUserId: string;
  onCreate: (payload: CreateTransactionRequest) => Promise<void>;
  onCreateCategory: (payload: { name: string; type: number }) => Promise<CategoryResponse>;
  /** Quando presente, o sheet abre em modo edição para esta transação. */
  editingTransaction?: FinancialTransactionResponse | null;
  onUpdate?: (payload: UpdateTransactionRequest) => Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const toApiDateTime = (isoDate: string) => {
  if (!isoDate) return new Date().toISOString();
  if (isoDate.includes('T')) return new Date(isoDate).toISOString();
  return new Date(`${isoDate}T12:00:00`).toISOString();
};
const toInputDate = (iso?: string | null) => (iso ? String(iso).slice(0, 10) : todayIso());

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function TransactionSheet({
  open,
  onClose,
  categories,
  nestId,
  currentUserId,
  onCreate,
  onCreateCategory,
  editingTransaction = null,
  onUpdate,
}: TransactionSheetProps) {
  const isEditMode = editingTransaction !== null;
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { showError } = useToastNotifications();

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
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);

  // Expense extras
  const [dueDate, setDueDate] = useState(todayIso());
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);

  // Income extras
  const [sourceId, setSourceId] = useState('');

  useEffect(() => {
    if (!nestId) return;
    let active = true;
    nestService
      .getNestMembers(nestId)
      .then((m) => {
        if (active) setMembers(m);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nestId]);

  useEffect(() => {
    if (!nestId) return;
    let active = true;
    bankAccountService
      .listBankAccounts(nestId)
      .then((a) => {
        if (active) setBankAccounts(a);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [nestId]);

  useEffect(() => {
    if (!open) return;
    const defaultAccount =
      bankAccounts.find((a) => a.isActive)?.bankAccountId ?? bankAccounts[0]?.bankAccountId ?? '';
    if (editingTransaction) {
      const t = editingTransaction;
      setType(t.transactionType);
      setDescription(t.description ?? '');
      const rawVal =
        t.value !== undefined && t.value !== null
          ? Number(t.value)
          : (t as unknown as { amount?: number }).amount !== undefined
            ? Number((t as unknown as { amount?: number }).amount)
            : null;
      setAmount(rawVal);
      setTransactionDate(toInputDate(t.transactionDate));
      setCategoryId(t.categoryId ?? '');
      setResponsibleUserId(t.responsibleUserId || currentUserId);
      setObservation(t.observation ?? '');
      setDueDate(t.dueDate ? toInputDate(t.dueDate) : todayIso());
      setPaymentMethod(null);
      setSourceId(t.sourceId ?? defaultAccount);
      setIsDetailsOpen(true);
      return;
    }
    setType(TransactionType.Expense);
    setDescription('');
    setAmount(null);
    setTransactionDate(todayIso());
    setCategoryId('');
    setResponsibleUserId(currentUserId);
    setObservation('');
    setDueDate(todayIso());
    setPaymentMethod(null);
    setSourceId(defaultAccount);
    setIsDetailsOpen(false);
  }, [open, currentUserId, editingTransaction, bankAccounts]);

  useEffect(() => {
    if (type === TransactionType.Income && !sourceId && bankAccounts.length > 0) {
      const defaultAccount =
        bankAccounts.find((a) => a.isActive)?.bankAccountId ?? bankAccounts[0]?.bankAccountId ?? '';
      if (defaultAccount) {
        setSourceId(defaultAccount);
      }
    }
  }, [type, sourceId, bankAccounts]);

  const handleTypeChange = (newType: number) => {
    setType(newType);
    setCategoryId('');
    setDueDate(todayIso());
    setPaymentMethod(null);
    if (newType === TransactionType.Income) {
      const defaultAccount =
        bankAccounts.find((a) => a.isActive)?.bankAccountId ?? bankAccounts[0]?.bankAccountId ?? '';
      setSourceId(defaultAccount);
    } else {
      setSourceId('');
    }
    setIsDetailsOpen(false);
  };

  const visibleCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      showError('Informe a descrição do lançamento.');
      return;
    }
    if (amount === null || isNaN(amount) || amount <= 0) {
      showError('Informe um valor válido maior que zero.');
      return;
    }
    if (!categoryId) {
      showError('Selecione uma categoria.');
      return;
    }
    const finalResponsible = responsibleUserId || currentUserId;
    if (!finalResponsible) {
      showError('Selecione o responsável pelo lançamento.');
      return;
    }
    if (type === TransactionType.Income && !sourceId) {
      showError('Selecione a conta bancária de destino da receita.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isExpenseType = type === TransactionType.Expense;
      if (isEditMode && editingTransaction && onUpdate) {
        await onUpdate({
          financialTransactionId: editingTransaction.financialTransactionId,
          type,
          description: trimmedDesc,
          amount: amount as number,
          transactionDate: toApiDateTime(transactionDate),
          dueDate: isExpenseType && dueDate ? toApiDateTime(dueDate) : null,
          categoryId,
          responsibleUserId: finalResponsible,
          sourceId: isExpenseType ? null : sourceId || null,
          observation: observation.trim() || null,
        });
      } else {
        await onCreate({
          type,
          description: trimmedDesc,
          amount: amount as number,
          transactionDate: toApiDateTime(transactionDate),
          dueDate: isExpenseType && dueDate ? toApiDateTime(dueDate) : null,
          categoryId,
          responsibleUserId: finalResponsible,
          sourceId: isExpenseType ? null : sourceId || null,
        });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpense = type === TransactionType.Expense;
  const submitColor = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
  const submitLabel = isSubmitting
    ? 'Salvando…'
    : isEditMode
      ? 'Salvar alterações'
      : isExpense
        ? 'Registrar despesa'
        : 'Registrar receita';

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'max-h-[92dvh] overflow-y-auto rounded-t-2xl px-5 pb-6 pt-3 focus:outline-none'
            : 'w-full overflow-y-auto px-7 pb-7 pt-5 focus:outline-none sm:w-[540px] sm:max-w-xl md:w-[560px]'
        }
      >
        {/* Handle — só no mobile */}
        {isMobile && <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" aria-hidden />}

        <div className="font-ui mb-3 flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="font-editorial text-xl font-bold text-foreground">
            {isEditMode ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {isEditMode ? 'Edição' : 'Cadastro'}
          </span>
        </div>

        {editingTransaction?.shoppingListId && (
          <div className="font-ui mb-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            <ShoppingCart size={14} className="shrink-0" />
            <span>Transação gerada automaticamente por uma Lista de Compras.</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(e).catch(() => {});
          }}
          className="space-y-4"
        >
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
                  onCreateCategory={onCreateCategory}
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
                  onDetailsToggle={() => setIsDetailsOpen((v) => !v)}
                  categories={visibleCategories}
                  members={members}
                  isEdit={isEditMode}
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
                  onCreateCategory={onCreateCategory}
                  transactionDate={transactionDate}
                  onDateChange={setTransactionDate}
                  responsibleUserId={responsibleUserId}
                  onResponsibleChange={setResponsibleUserId}
                  sourceId={sourceId}
                  onSourceIdChange={setSourceId}
                  bankAccounts={bankAccounts}
                  observation={observation}
                  onObservationChange={setObservation}
                  isDetailsOpen={isDetailsOpen}
                  onDetailsToggle={() => setIsDetailsOpen((v) => !v)}
                  categories={visibleCategories}
                  members={members}
                  isEdit={isEditMode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ backgroundColor: submitColor }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="overflow-hidden rounded-xl"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="w-full bg-transparent font-semibold text-white hover:bg-black/10 disabled:opacity-50"
            >
              {submitLabel}
            </Button>
          </motion.div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

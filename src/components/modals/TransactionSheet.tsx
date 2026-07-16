// src/components/modals/TransactionSheet.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Button, Sheet, SheetContent } from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { CategoryResponse } from '@/schemas/category';
import { FinancialSourceType, TransactionType } from '@/schemas/enums';
import type { CreateTransactionRequest } from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
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
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const toApiDateTime = (isoDate: string) => new Date(`${isoDate}T12:00:00`).toISOString();

const EXPENSE_COLOR = '#e07070';
const INCOME_COLOR = '#6ab085';

export function TransactionSheet({
  open, onClose, categories, nestId, currentUserId, onCreate,
}: TransactionSheetProps) {
  const isMobile = useIsMobile();
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
  }, [open, currentUserId]);

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
      const isExpenseType = type === TransactionType.Expense;
      await onCreate({
        type,
        description: description.trim(),
        amount: amount as number,
        transactionDate: toApiDateTime(transactionDate),
        dueDate: isExpenseType ? toApiDateTime(dueDate) : null,
        incomeOrigin: isExpenseType ? null : (incomeSource.trim() || null),
        categoryId,
        responsibleUserId,
        sourceType: FinancialSourceType.Manual,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpense = type === TransactionType.Expense;
  const submitColor = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
  const submitLabel = isSubmitting
    ? 'Salvando…'
    : isExpense ? 'Registrar despesa' : 'Registrar receita';

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={isMobile
          ? 'rounded-t-2xl px-4 pb-6 pt-3 max-h-[92dvh] overflow-y-auto focus:outline-none'
          : 'w-[420px] px-6 pb-6 pt-4 overflow-y-auto focus:outline-none'
        }
      >
        {/* Handle — só no mobile */}
        {isMobile && <div className="w-9 h-1 rounded-full bg-border mx-auto mb-4" aria-hidden />}

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
                  isEdit={false}
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
                  isEdit={false}
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

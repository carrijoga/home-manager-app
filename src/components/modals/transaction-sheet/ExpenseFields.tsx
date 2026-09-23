// src/components/modals/transaction-sheet/ExpenseFields.tsx
import { CategoryCombobox } from '@/components/common/CategoryCombobox';
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import type { CategoryResponse } from '@/schemas/category';
import { ApiPaymentMethod, TransactionType } from '@/schemas/enums';
import type { NestMember } from '@/schemas/nest';

import { MoreDetails } from './MoreDetails';

interface ExpenseFieldsProps {
  categoryId: string;
  onCategoryChange: (v: string) => void;
  onCreateCategory: (payload: { name: string; type: number }) => Promise<CategoryResponse>;
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
  categoryId,
  onCategoryChange,
  onCreateCategory,
  transactionDate,
  onDateChange,
  responsibleUserId,
  onResponsibleChange,
  dueDate,
  onDueDateChange,
  paymentMethod,
  onPaymentMethodChange,
  observation,
  onObservationChange,
  isDetailsOpen,
  onDetailsToggle,
  categories,
  members,
  isEdit,
}: ExpenseFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-date"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Data
          </Label>
          <Input
            id="tx-date"
            type="date"
            value={transactionDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="border-border/40 bg-muted/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-category"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Categoria
          </Label>
          <CategoryCombobox
            categories={categories}
            value={categoryId}
            onChange={onCategoryChange}
            defaultType={TransactionType.Expense}
            onCreateCategory={onCreateCategory}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="tx-responsible"
          className="text-xs uppercase tracking-wide text-muted-foreground"
        >
          Responsável
        </Label>
        <Select value={responsibleUserId} onValueChange={onResponsibleChange}>
          <SelectTrigger id="tx-responsible" className="border-border/40 bg-muted/30">
            <SelectValue placeholder="Selecionar…" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.name}
              </SelectItem>
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
          <Label htmlFor="tx-due" className="text-xs uppercase tracking-wide text-muted-foreground">
            Vencimento
          </Label>
          <Input
            id="tx-due"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="border-border/40 bg-muted/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-method"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Método de pagamento
          </Label>
          <Select
            value={paymentMethod !== null ? String(paymentMethod) : ''}
            onValueChange={(v) => onPaymentMethodChange(v ? Number(v) : null)}
          >
            <SelectTrigger id="tx-method" className="border-border/40 bg-muted/30">
              <SelectValue placeholder="Selecionar…" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-obs-expense"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Observação
          </Label>
          <Textarea
            id="tx-obs-expense"
            rows={2}
            value={observation}
            onChange={(e) => onObservationChange(e.target.value)}
            placeholder="Opcional"
            className="resize-none border-border/40 bg-muted/30"
          />
        </div>
      </MoreDetails>
    </div>
  );
}

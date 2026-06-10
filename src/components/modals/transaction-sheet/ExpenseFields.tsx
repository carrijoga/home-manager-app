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

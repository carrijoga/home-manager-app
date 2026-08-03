// src/components/modals/transaction-sheet/IncomeFields.tsx
import { CategoryCombobox } from '@/components/common/CategoryCombobox';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';
import type { BankAccountResponse } from '@/schemas/bank-account';
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';
import type { NestMember } from '@/schemas/nest';

import { MoreDetails } from './MoreDetails';

interface IncomeFieldsProps {
  categoryId: string;
  onCategoryChange: (v: string) => void;
  onCreateCategory: (payload: { name: string; type: number }) => Promise<CategoryResponse>;
  transactionDate: string;
  onDateChange: (v: string) => void;
  responsibleUserId: string;
  onResponsibleChange: (v: string) => void;
  sourceId: string;
  onSourceIdChange: (v: string) => void;
  bankAccounts: BankAccountResponse[];
  observation: string;
  onObservationChange: (v: string) => void;
  isDetailsOpen: boolean;
  onDetailsToggle: () => void;
  categories: CategoryResponse[];
  members: NestMember[];
  isEdit: boolean;
}

export function IncomeFields({
  categoryId, onCategoryChange, onCreateCategory,
  transactionDate, onDateChange,
  responsibleUserId, onResponsibleChange,
  sourceId, onSourceIdChange, bankAccounts,
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
          <CategoryCombobox
            categories={categories}
            value={categoryId}
            onChange={onCategoryChange}
            defaultType={TransactionType.Income}
            onCreateCategory={onCreateCategory}
          />
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

      <div className="space-y-1.5">
        <Label htmlFor="tx-source-account" className="text-xs text-muted-foreground uppercase tracking-wide">Conta Bancária</Label>
        {bankAccounts.length > 0 ? (
          <Select value={sourceId} onValueChange={onSourceIdChange}>
            <SelectTrigger id="tx-source-account" className="bg-muted/30 border-border/40">
              <SelectValue placeholder="Selecionar…" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map(a => (
                <SelectItem key={a.bankAccountId} value={a.bankAccountId}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-muted-foreground bg-muted/30 border border-border/40 rounded-md px-3 py-2">
            Nenhuma conta bancária cadastrada — crie uma na tela de Contas para registrar receitas.
          </p>
        )}
      </div>

      <MoreDetails
        isOpen={isDetailsOpen || isEdit}
        onToggle={onDetailsToggle}
        hint="observação"
      >
        <div className="space-y-1.5">
          <Label htmlFor="tx-obs-income" className="text-xs text-muted-foreground uppercase tracking-wide">Observação</Label>
          <Textarea id="tx-obs-income" rows={2} value={observation} onChange={e => onObservationChange(e.target.value)} placeholder="Opcional" className="bg-muted/30 border-border/40 resize-none" />
        </div>
      </MoreDetails>
    </div>
  );
}

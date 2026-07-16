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

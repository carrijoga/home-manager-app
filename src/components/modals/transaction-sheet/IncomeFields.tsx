// src/components/modals/transaction-sheet/IncomeFields.tsx
import { Info } from 'lucide-react';

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
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
  categoryId,
  onCategoryChange,
  onCreateCategory,
  transactionDate,
  onDateChange,
  responsibleUserId,
  onResponsibleChange,
  sourceId,
  onSourceIdChange,
  bankAccounts,
  observation,
  onObservationChange,
  isDetailsOpen,
  onDetailsToggle,
  categories,
  members,
  isEdit,
}: IncomeFieldsProps) {
  const activeBankAccounts = bankAccounts.filter((a) => a.isActive || a.bankAccountId === sourceId);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-date-income"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Data
          </Label>
          <Input
            id="tx-date-income"
            type="date"
            value={transactionDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="border-border/40 bg-muted/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-category-income"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Categoria
          </Label>
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
        <Label
          htmlFor="tx-responsible-income"
          className="text-xs uppercase tracking-wide text-muted-foreground"
        >
          Responsável
        </Label>
        <Select value={responsibleUserId} onValueChange={onResponsibleChange}>
          <SelectTrigger id="tx-responsible-income" className="border-border/40 bg-muted/30">
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

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label
            htmlFor="tx-source-account"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Conta Bancária
          </Label>
          {isEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                  >
                    <Info
                      size={13}
                      className="opacity-70"
                      aria-label="Informações sobre a conta bancária"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  A conta bancária não pode ser alterada na edição da receita.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {activeBankAccounts.length > 0 ? (
          isEdit ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full cursor-not-allowed">
                    <Select value={sourceId} onValueChange={onSourceIdChange} disabled>
                      <SelectTrigger
                        id="tx-source-account"
                        className="pointer-events-none cursor-not-allowed border-border/40 bg-muted/30 opacity-75"
                      >
                        <SelectValue placeholder="Selecionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeBankAccounts.map((a) => (
                          <SelectItem key={a.bankAccountId} value={a.bankAccountId}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  A conta bancária não pode ser alterada na edição da receita.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Select value={sourceId} onValueChange={onSourceIdChange}>
              <SelectTrigger id="tx-source-account" className="border-border/40 bg-muted/30">
                <SelectValue placeholder="Selecionar…" />
              </SelectTrigger>
              <SelectContent>
                {activeBankAccounts.map((a) => (
                  <SelectItem key={a.bankAccountId} value={a.bankAccountId}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        ) : (
          <p className="rounded-md border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Nenhuma conta bancária ativa cadastrada — crie ou ative uma conta na tela de Contas para
            registrar receitas.
          </p>
        )}
      </div>

      <MoreDetails isOpen={isDetailsOpen || isEdit} onToggle={onDetailsToggle} hint="observação">
        <div className="space-y-1.5">
          <Label
            htmlFor="tx-obs-income"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Observação
          </Label>
          <Textarea
            id="tx-obs-income"
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

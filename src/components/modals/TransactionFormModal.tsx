import { useEffect, useState } from 'react';

import MoneyInput from '@/components/common/MoneyInput';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { FinancialSourceType, TransactionType } from '@/schemas/enums';
import type {
  CreateTransactionRequest,
  FinancialTransactionResponse,
  UpdateTransactionRequest,
} from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
import * as nestService from '@/services/nestService';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  /** null = criação; preenchida = edição. */
  transaction: FinancialTransactionResponse | null;
  categories: CategoryResponse[];
  nestId: string | undefined;
  /** id do usuário logado — default do responsável. */
  currentUserId: string;
  onCreate: (payload: CreateTransactionRequest) => Promise<void>;
  onUpdate: (payload: UpdateTransactionRequest) => Promise<void>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const toApiDateTime = (isoDate: string) => new Date(`${isoDate}T12:00:00`).toISOString();

/** Criação/edição de transação. Fonte fixa em Manual (API não lista contas bancárias ainda). */
export function TransactionFormModal({
  open,
  onClose,
  transaction,
  categories,
  nestId,
  currentUserId,
  onCreate,
  onUpdate,
}: TransactionFormModalProps) {
  const isEdit = transaction !== null;

  const [type, setType] = useState<number>(TransactionType.Expense);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [transactionDate, setTransactionDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState(currentUserId);
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [members, setMembers] = useState<NestMember[]>([]);

  // Busca membros quando o nestId muda — resultado fica em cache no estado local
  useEffect(() => {
    if (!nestId) return;
    let active = true;
    nestService
      .getNestMembers(nestId)
      .then(m => { if (active) setMembers(m); })
      .catch(() => {});
    return () => { active = false; };
  }, [nestId]);

  // Pré-preenche ao abrir (criação reseta; edição carrega a transação)
  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setType(transaction.transactionType);
      setDescription(transaction.description);
      setAmount(Number(transaction.value));
      setTransactionDate(String(transaction.transactionDate).slice(0, 10));
      setDueDate(String(transaction.dueDate).slice(0, 10));
      setCategoryId(transaction.categoryId);
      setResponsibleUserId(transaction.responsibleUserId);
      setObservation(transaction.observation ?? '');
    } else {
      setType(TransactionType.Expense);
      setDescription('');
      setAmount(null);
      setTransactionDate(todayIso());
      setDueDate(todayIso());
      setCategoryId('');
      setResponsibleUserId(currentUserId);
      setObservation('');
    }
  }, [open, transaction, currentUserId]);

  const visibleCategories = categories.filter(c => c.type === type);
  // members.length impede submit antes da lista carregar (modo API) — evita
  // enviar responsibleUserId não confirmado pelo Nest.
  const isValid =
    description.trim().length > 0 &&
    amount !== null &&
    amount > 0 &&
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

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={e => { void handleSubmit(e).catch(() => {}); }} className="space-y-4">
          {/* Tipo */}
          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Tipo de transação"
            onKeyDown={e => {
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                setType(t => (t === TransactionType.Expense ? TransactionType.Income : TransactionType.Expense));
                setCategoryId('');
              }
            }}
          >
            {[
              { v: TransactionType.Expense, label: 'Despesa' },
              { v: TransactionType.Income, label: 'Receita' },
            ].map(opt => (
              <button
                key={opt.v}
                type="button"
                role="radio"
                aria-checked={type === opt.v}
                onClick={() => { setType(opt.v); setCategoryId(''); }}
                className={`font-ui text-sm font-semibold rounded-xl py-2 border transition-colors duration-[length:var(--dur-base)] ${
                  type === opt.v
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <Label htmlFor="tx-description">Descrição</Label>
            <Input
              id="tx-description"
              placeholder="Ex.: Conta de luz"
              value={description}
              onChange={e => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tx-amount">Valor</Label>
              <MoneyInput id="tx-amount" value={amount} onChange={setAmount} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="tx-category">
                  <SelectValue placeholder="Selecionar…" />
                </SelectTrigger>
                <SelectContent>
                  {visibleCategories.map(c => (
                    <SelectItem key={c.categoryId} value={c.categoryId}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tx-date">Data</Label>
              <Input id="tx-date" type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-due">Vencimento</Label>
              <Input id="tx-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tx-responsible">Responsável</Label>
            <Select value={responsibleUserId} onValueChange={setResponsibleUserId}>
              <SelectTrigger id="tx-responsible">
                <SelectValue placeholder="Selecionar…" />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.userId} value={m.userId}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="space-y-1">
              <Label htmlFor="tx-observation">Observação</Label>
              <Textarea
                id="tx-observation"
                rows={2}
                value={observation}
                onChange={e => setObservation(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar transação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

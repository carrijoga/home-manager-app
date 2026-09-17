import { ArrowLeftRight, Plus, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { AdjustBalanceDialog } from '@/components/modals/AdjustBalanceDialog';
import { BankAccountSheet } from '@/components/modals/BankAccountSheet';
import { DeleteAccountDialog } from '@/components/modals/DeleteAccountDialog';
import { InactivateAccountDialog } from '@/components/modals/InactivateAccountDialog';
import { TransferAccountDialog } from '@/components/modals/TransferAccountDialog';
import { AccountSkeleton } from '@/components/skeletons/AccountSkeleton';
import { Button } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type {
  AdjustBalanceRequest,
  BankAccountResponse,
  CreateBankAccountRequest,
  TransferBankAccountRequest,
  UpdateBankAccountRequest,
} from '@/schemas/bank-account';
import { AccountType } from '@/schemas/enums';
import * as bankAccountService from '@/services/bankAccountService';
import { formatCurrency } from '@/utils/formatters';

import { AccountDetails } from './account/AccountDetails';
import { AccountList } from './account/AccountList';
import { FinancialFilterPills, type FilterPillItem } from './shared/FinancialFilterPills';
import { FinancialHudCard, type HudSegment } from './shared/FinancialHudCard';
import { FinancialPageHeader } from './shared/FinancialPageHeader';

export function FinancialAccount() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('todas');
  const [canDeleteSelected, setCanDeleteSelected] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountResponse | null>(null);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustingAccount, setAdjustingAccount] = useState<BankAccountResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<BankAccountResponse | null>(null);

  const [inactivateOpen, setInactivateOpen] = useState(false);
  const [inactivatingAccount, setInactivatingAccount] = useState<BankAccountResponse | null>(null);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState<string | null>(null);

  const nestId = activeNestId ?? undefined;

  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await bankAccountService.listBankAccounts(nestId);
      setAccounts(list);
      setSelectedId((prev) => {
        if (prev && list.some((a) => a.bankAccountId === prev)) return prev;
        return list.find((a) => a.isActive)?.bankAccountId ?? list[0]?.bankAccountId ?? null;
      });
    } catch {
      showErrorRef.current('Não foi possível carregar as contas.');
    } finally {
      setLoading(false);
    }
  }, [nestId]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const selectedAccount = accounts.find((a) => a.bankAccountId === selectedId) ?? null;

  useEffect(() => {
    if (!selectedAccount) {
      setCanDeleteSelected(false);
      return;
    }
    let active = true;
    bankAccountService
      .canDeleteBankAccount(selectedAccount.bankAccountId, nestId)
      .then((res) => {
        if (active) setCanDeleteSelected(res.canDelete);
      })
      .catch(() => {
        if (active) setCanDeleteSelected(false);
      });
    return () => {
      active = false;
    };
  }, [selectedAccount, nestId]);

  const handleCreate = async (payload: CreateBankAccountRequest) => {
    try {
      await bankAccountService.createBankAccount(payload, nestId);
      showSuccess('Conta criada!');
      await loadAccounts();
    } catch {
      showError('Não foi possível criar a conta.');
      throw new Error('create failed');
    }
  };

  const handleUpdate = async (id: string, payload: UpdateBankAccountRequest) => {
    try {
      await bankAccountService.updateBankAccount(id, payload, nestId);
      showSuccess('Conta atualizada!');
      await loadAccounts();
    } catch {
      showError('Não foi possível atualizar a conta.');
      throw new Error('update failed');
    }
  };

  const handleAdjustBalance = async (id: string, payload: AdjustBalanceRequest) => {
    try {
      await bankAccountService.adjustBankAccountBalance(id, payload, nestId);
      showSuccess('Saldo atualizado com sucesso!');
      await loadAccounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível alterar o saldo.';
      showError(msg);
      throw err;
    }
  };

  const handleTransfer = async (payload: TransferBankAccountRequest) => {
    try {
      await bankAccountService.transferBetweenBankAccounts(payload, nestId);
      showSuccess('Transferência realizada com sucesso!');
      await loadAccounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível realizar a transferência.';
      showError(msg);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return;
    try {
      await bankAccountService.deleteBankAccount(deletingAccount.bankAccountId, nestId);
      showSuccess('Conta excluída.');
      await loadAccounts();
    } catch {
      showError('Não foi possível excluir a conta.');
      throw new Error('delete failed');
    }
  };

  const handleConfirmInactivate = async () => {
    if (!inactivatingAccount) return;
    try {
      const result = await bankAccountService.inactivateBankAccount(
        inactivatingAccount.bankAccountId,
        nestId
      );
      showSuccess(
        result.affectedPaymentCardsCount > 0
          ? `Conta inativada. ${result.affectedPaymentCardsCount} cartão(ões) também foi(ram) inativado(s).`
          : 'Conta inativada.'
      );
      await loadAccounts();
    } catch {
      showError('Não foi possível inativar a conta.');
      throw new Error('inactivate failed');
    }
  };

  const handleToggleActive = async (account: BankAccountResponse) => {
    if (account.isActive) {
      setInactivatingAccount(account);
      setInactivateOpen(true);
      return;
    }

    try {
      await bankAccountService.activateBankAccount(account.bankAccountId, nestId);
      showSuccess('Conta ativada.');
      await loadAccounts();
    } catch {
      showError('Não foi possível ativar a conta.');
      throw new Error('activate failed');
    }
  };

  const canDeleteMap = selectedId ? { [selectedId]: canDeleteSelected } : {};

  const openCreate = () => {
    setEditingAccount(null);
    setSheetOpen(true);
  };
  const openEdit = (account: BankAccountResponse) => {
    setEditingAccount(account);
    setSheetOpen(true);
  };
  const openAdjust = (account: BankAccountResponse) => {
    setAdjustingAccount(account);
    setAdjustOpen(true);
  };
  const openDelete = (account: BankAccountResponse) => {
    setDeletingAccount(account);
    setDeleteOpen(true);
  };
  const openTransfer = (account?: BankAccountResponse) => {
    setTransferSourceId(account?.bankAccountId ?? selectedId ?? null);
    setTransferOpen(true);
  };

  // Cálculos do HUD consolidado
  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive), [accounts]);
  const inactiveAccounts = useMemo(() => accounts.filter((a) => !a.isActive), [accounts]);

  const totalConsolidated = useMemo(() => {
    return activeAccounts.reduce((acc, a) => acc + Number(a.balance || 0), 0);
  }, [activeAccounts]);

  const largestAccount = useMemo(() => {
    if (activeAccounts.length === 0) return null;
    return [...activeAccounts].sort((a, b) => Number(b.balance) - Number(a.balance))[0];
  }, [activeAccounts]);

  const largestAccountPct = useMemo(() => {
    if (!largestAccount || totalConsolidated <= 0) return 0;
    return Math.round((Number(largestAccount.balance) / totalConsolidated) * 100);
  }, [largestAccount, totalConsolidated]);

  // Segmentos da barra de distribuição
  const hudSegments: HudSegment[] = useMemo(() => {
    const positiveAccounts = activeAccounts.filter((a) => Number(a.balance) > 0);
    const positiveSum = positiveAccounts.reduce((sum, a) => sum + Number(a.balance), 0);
    if (positiveSum <= 0) return [];

    const defaultGradients = [
      'bg-gradient-to-r from-emerald-500 to-teal-400',
      'bg-gradient-to-r from-primary to-amber-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500',
      'bg-gradient-to-r from-sky-500 to-blue-500',
    ];

    return positiveAccounts.map((a, idx) => {
      const pct = (Number(a.balance) / positiveSum) * 100;
      return {
        percentage: pct,
        color: a.color ? '' : (defaultGradients[idx % defaultGradients.length] ?? 'bg-primary'),
        label: `${a.name}: ${pct.toFixed(0)}%`,
      };
    });
  }, [activeAccounts]);

  // Filtros em pílulas
  const filterPills: FilterPillItem[] = useMemo(() => {
    const checkingCount = accounts.filter((a) => a.type === AccountType.Checking && a.isActive).length;
    const savingsCount = accounts.filter((a) => a.type === AccountType.Savings && a.isActive).length;
    const cashCount = accounts.filter((a) => a.type === AccountType.Cash && a.isActive).length;

    const items: FilterPillItem[] = [
      { id: 'todas', label: 'Todas', count: activeAccounts.length },
    ];

    if (checkingCount > 0) items.push({ id: 'corrente', label: 'Corrente', count: checkingCount });
    if (savingsCount > 0) items.push({ id: 'poupanca', label: 'Poupança / Reserva', count: savingsCount });
    if (cashCount > 0) items.push({ id: 'dinheiro', label: 'Dinheiro', count: cashCount });
    if (inactiveAccounts.length > 0) items.push({ id: 'inativas', label: 'Inativas', count: inactiveAccounts.length });

    return items;
  }, [accounts, activeAccounts.length, inactiveAccounts.length]);

  // Contas filtradas
  const displayedAccounts = useMemo(() => {
    if (selectedFilter === 'corrente') {
      return accounts.filter((a) => a.type === AccountType.Checking && a.isActive);
    }
    if (selectedFilter === 'poupanca') {
      return accounts.filter((a) => a.type === AccountType.Savings && a.isActive);
    }
    if (selectedFilter === 'dinheiro') {
      return accounts.filter((a) => a.type === AccountType.Cash && a.isActive);
    }
    if (selectedFilter === 'inativas') {
      return inactiveAccounts;
    }
    return activeAccounts;
  }, [accounts, activeAccounts, inactiveAccounts, selectedFilter]);

  if (loading) return <AccountSkeleton />;

  return (
    <div className="flex max-w-full flex-col gap-4 overflow-x-hidden animate-in fade-in duration-200">
      {/* 1. Cabeçalho Padronizado */}
      <FinancialPageHeader
        title="Contas"
        description="Gerencie seus saldos e contas bancárias"
        badgeLabel={`${activeAccounts.length} ${activeAccounts.length === 1 ? 'Ativa' : 'Ativas'}`}
        actions={
          <>
            {activeAccounts.length >= 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openTransfer()}
                className="h-9 rounded-xl px-3 font-bold gap-1.5 border-border/70 bg-card shadow-subtle hover:bg-muted active:scale-[0.98]"
              >
                <ArrowLeftRight size={14} className="text-primary" />
                <span>Transferir</span>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={openCreate}
              className="h-9 rounded-xl px-3.5 font-bold gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Nova Conta</span>
            </Button>
          </>
        }
      />

      {accounts.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-6">
          <EmptyState
            icon={Wallet}
            title="Nenhuma conta ainda"
            description="Adicione uma conta bancária para acompanhar seus saldos."
            action={
              <Button
                onClick={openCreate}
                className="h-11 rounded-2xl px-5 font-bold shadow-sm"
              >
                <Plus size={16} strokeWidth={3} className="mr-1.5" /> Adicionar conta
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* 2. Placar HUD Hero (Estilo Modo Mercado) */}
          <FinancialHudCard
            primaryLabel="SALDO TOTAL CONSOLIDADO"
            primaryValue={formatCurrency(totalConsolidated)}
            primarySubtitle={`em ${activeAccounts.length} ${activeAccounts.length === 1 ? 'conta ativa' : 'contas ativas'}`}
            primaryColorClass={totalConsolidated < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}
            secondaryLabel="MAIOR RESERVA"
            secondaryValue={largestAccount ? formatCurrency(Number(largestAccount.balance)) : '—'}
            secondarySubtitle={largestAccountPct > 0 ? `(${largestAccountPct}%)` : undefined}
            secondaryTag={largestAccount?.name}
            segments={hudSegments}
            barLabelLeft="Distribuição de Patrimônio"
            barLabelRight="100% alocado"
            insightLeft={{
              icon: <Sparkles size={14} className="text-primary" />,
              text: 'Saldos bancários conciliados no Nest',
            }}
            insightRight={{
              icon: <TrendingUp size={14} />,
              text: totalConsolidated >= 0 ? 'Patrimônio positivo' : 'Saldo global negativo',
              colorClass: totalConsolidated >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
            }}
          />

          {/* 3. Filtros em Pílulas Deslizantes */}
          <FinancialFilterPills
            items={filterPills}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
          />

          {/* 4. Área Mestre-Detalhes (7x5 no desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <AccountList
                accounts={displayedAccounts}
                selectedId={selectedId}
                canDeleteMap={canDeleteMap}
                onSelect={setSelectedId}
                onEdit={openEdit}
                onAdjustBalance={openAdjust}
                onTransfer={openTransfer}
                onToggleActive={handleToggleActive}
                onDelete={openDelete}
              />
            </div>

            <div className="lg:col-span-5">
              {selectedAccount ? (
                <AccountDetails
                  account={selectedAccount}
                  onEdit={openEdit}
                  onAdjustBalance={openAdjust}
                  onTransfer={openTransfer}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-6 text-center text-sm text-muted-foreground">
                  Selecione uma conta para ver os detalhes
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modais preservados 100% */}
      <BankAccountSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        account={editingAccount}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <AdjustBalanceDialog
        open={adjustOpen}
        account={adjustingAccount}
        onClose={() => setAdjustOpen(false)}
        onConfirm={handleAdjustBalance}
      />

      <TransferAccountDialog
        open={transferOpen}
        accounts={accounts}
        defaultSourceId={transferSourceId}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleTransfer}
      />

      <DeleteAccountDialog
        open={deleteOpen}
        account={deletingAccount}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <InactivateAccountDialog
        open={inactivateOpen}
        account={inactivatingAccount}
        onClose={() => setInactivateOpen(false)}
        onConfirm={handleConfirmInactivate}
      />
    </div>
  );
}

export default FinancialAccount;

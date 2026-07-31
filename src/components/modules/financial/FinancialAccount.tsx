import { Plus, Wallet } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { BankAccountSheet } from '@/components/modals/BankAccountSheet';
import { DeleteAccountDialog } from '@/components/modals/DeleteAccountDialog';
import { AccountSkeleton } from '@/components/skeletons/AccountSkeleton';
import { Button } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import type {
  BankAccountResponse,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from '@/schemas/bank-account';
import * as bankAccountService from '@/services/bankAccountService';

import { AccountDetails } from './account/AccountDetails';
import { AccountList } from './account/AccountList';

export function FinancialAccount() {
  const { activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountResponse | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<BankAccountResponse | null>(null);

  const nestId = activeNestId ?? undefined;

  // showError retorna função nova a cada render; guardar em ref para que
  // loadAccounts dependa só de nestId e não entre em loop de flicker.
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await bankAccountService.listBankAccounts(nestId);
      setAccounts(list);
      setSelectedId((prev) => {
        if (prev && list.some((a) => a.bankAccountId === prev)) return prev;
        return list[0]?.bankAccountId ?? null;
      });
    } catch {
      showErrorRef.current('Não foi possível carregar as contas.');
    } finally {
      setLoading(false);
    }
  }, [nestId]);

  useEffect(() => { void loadAccounts(); }, [loadAccounts]);

  const selectedAccount = accounts.find((a) => a.bankAccountId === selectedId) ?? null;

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

  const handleConfirmDelete = async (confirmDeletion: boolean) => {
    if (!deletingAccount) return;
    try {
      await bankAccountService.deleteBankAccount(deletingAccount.bankAccountId, confirmDeletion, nestId);
      showSuccess('Conta excluída.');
      await loadAccounts();
    } catch {
      showError('Não foi possível excluir a conta.');
      throw new Error('delete failed');
    }
  };

  const openCreate = () => { setEditingAccount(null); setSheetOpen(true); };
  const openEdit = (account: BankAccountResponse) => { setEditingAccount(account); setSheetOpen(true); };
  const openDelete = (account: BankAccountResponse) => { setDeletingAccount(account); setDeleteOpen(true); };

  if (loading) return <AccountSkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-full overflow-x-hidden">
      <div className="flex items-center gap-3">
        <Wallet size={18} className="text-foreground" strokeWidth={1.5} aria-hidden="true" />
        <div>
          <h1 className="font-editorial font-bold text-foreground text-2xl">Contas</h1>
          <p className="font-ui text-sm text-muted-foreground">Gerencie suas contas bancárias</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="p-6 rounded-3xl bg-card border border-border">
          <EmptyState
            icon={Wallet}
            title="Nenhuma conta ainda"
            description="Adicione uma conta bancária para acompanhar seus saldos."
            action={
              <Button onClick={openCreate} size="sm" className="gap-2 font-semibold">
                <Plus size={16} strokeWidth={1.5} /> Adicionar conta
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-[240px] shrink-0">
            <AccountList
              accounts={accounts}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={openCreate}
            />
          </div>
          <div className="flex-1">
            {selectedAccount && (
              <AccountDetails account={selectedAccount} onEdit={openEdit} onDelete={openDelete} />
            )}
          </div>
        </div>
      )}

      <BankAccountSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        account={editingAccount}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <DeleteAccountDialog
        open={deleteOpen}
        account={deletingAccount}
        nestId={nestId}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default FinancialAccount;

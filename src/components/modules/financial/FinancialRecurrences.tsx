import { Repeat } from 'lucide-react';

import EmptyState from '@/components/common/EmptyState';

export function FinancialRecurrences() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Repeat size={18} className="text-primary" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="font-editorial text-lg font-bold text-foreground">Recorrências</h3>
        </div>
        <EmptyState
          icon={Repeat}
          title="Recorrências em breve!"
          description="Em breve você poderá cadastrar despesas e receitas recorrentes para acompanhar automaticamente."
        />
      </div>
    </div>
  );
}

export default FinancialRecurrences;

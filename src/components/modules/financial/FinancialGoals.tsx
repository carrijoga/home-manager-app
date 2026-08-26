import { Target } from 'lucide-react';

import EmptyState from '@/components/common/EmptyState';

export function FinancialGoals() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Target size={18} className="text-primary" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="font-editorial text-lg font-bold text-foreground">Metas</h3>
        </div>
        <EmptyState
          icon={Target}
          title="Metas em breve!"
          description="Em breve você poderá definir metas financeiras para a família e acompanhar o progresso por aqui."
        />
      </div>
    </div>
  );
}

export default FinancialGoals;

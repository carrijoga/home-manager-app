import {
  CreditCard,
  Landmark,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { RoleBadge } from '@/components/common/RoleBadge';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';

interface DashboardFamilyInsightsV2Props {
  members?: NestMember[];
  className?: string;
}

const SHORTCUTS = [
  {
    title: 'Metas do Ninho',
    subtitle: 'Objetivos & Economias',
    icon: PiggyBank,
    path: '/financial/goals',
    color: 'text-chart-2',
    bg: 'bg-chart-2/15',
  },
  {
    title: 'Recorrências',
    subtitle: 'Assinaturas & Fixos',
    icon: RefreshCw,
    path: '/financial/recurrences',
    color: 'text-primary',
    bg: 'bg-primary/15',
  },
  {
    title: 'Contas Bancárias',
    subtitle: 'Saldos & Extratos',
    icon: Landmark,
    path: '/financial/account',
    color: 'text-secondary',
    bg: 'bg-secondary/15',
  },
  {
    title: 'Cartões de Crédito',
    subtitle: 'Faturas & Limites',
    icon: CreditCard,
    path: '/financial/card',
    color: 'text-chart-5',
    bg: 'bg-chart-5/15',
  },
];

export function DashboardFamilyInsightsV2({
  members = [],
  className,
}: DashboardFamilyInsightsV2Props) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs',
        className
      )}
    >
      {/* Atalhos Rápidos */}
      <div>
        <div className="flex items-center gap-2 pb-3">
          <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={14} />
          </div>
          <h4 className="font-editorial text-sm font-bold text-foreground">
            Acesso Rápido aos Módulos
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="group flex flex-col items-start gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3 text-left transition-all hover:bg-muted/50 hover:border-border active:scale-98"
              >
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                    item.bg,
                    item.color
                  )}
                >
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <span className="font-ui block truncate text-xs font-bold text-foreground group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="font-ui block truncate text-[10px] text-muted-foreground">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Moradores do Ninho */}
      {members.length > 0 && (
        <div className="border-t border-dashed border-border/70 pt-3">
          <div className="flex items-center justify-between gap-2 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Users size={13} className="text-primary" />
              Membros do Ninho ({members.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 py-1 pl-1 pr-2.5 text-xs"
              >
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="size-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-foreground truncate max-w-[100px]">
                  {member.name.split(' ')[0]}
                </span>
                <RoleBadge role={member.role} className="h-3.5 px-1 text-[8px] py-0 ml-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

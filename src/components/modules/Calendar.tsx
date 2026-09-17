import { Calendar as CalendarIcon } from 'lucide-react';
import type { FC } from 'react';

import EmptyState from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Módulo de Calendário (Placeholder para integração futura com Google Calendar)
 */
export const Calendar: FC = () => {
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-editorial text-xl font-bold tracking-tight text-foreground">
            Calendário da Casa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarIcon}
            title="Calendário em breve!"
            description="Este calendário exibirá eventos importantes, como reuniões de condomínio, datas de pagamento e lembretes de manutenção."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;

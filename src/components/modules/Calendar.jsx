import { Calendar as CalendarIcon } from 'lucide-react';

import Card from '../common/Card';
import EmptyState from '../common/EmptyState';

/**
 * Módulo de Calendário (Placeholder para integração futura com Google Calendar)
 */
const Calendar = () => {
  return (
    <div className="space-y-6">
      <Card title="Calendário da Casa">
        <EmptyState
          icon={CalendarIcon}
          title="Calendário em breve!"
          description="Este calendário exibirá eventos importantes, como reuniões de condomínio, datas de pagamento e lembretes de manutenção."
        />
      </Card>
    </div>
  );
};

export default Calendar;

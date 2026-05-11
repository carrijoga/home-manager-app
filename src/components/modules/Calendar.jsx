import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import Card from '../common/Card';

/**
 * Módulo de Calendário (Placeholder para integração futura com Google Calendar)
 */
const Calendar = () => {
  return (
    <div className="space-y-6">
      <Card title="Calendário da Casa">
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon size={64} className="mx-auto mb-4 opacity-50 text-terracotta-400" />
          <p className="text-lg">Calendário em breve!</p>
          <p className="text-sm mt-2">
            Este calendário exibirá eventos importantes, como reuniões de condomínio, datas de pagamento e lembretes de manutenção!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;

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
        <div className="bg-linen-100 dark:bg-muted border-l-4 border-honey-400 dark:border-honey-600 p-4 rounded-xl mb-4">
          <p className="text-foreground">
            <strong>Integração com Google Calendar:</strong> Para integrar seu Google Calendar,
            você precisará configurar a autenticação OAuth2 no backend da aplicação.
          </p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon size={64} className="mx-auto mb-4 opacity-50 text-terracotta-400" />
          <p className="text-lg">Calendário em breve!</p>
          <p className="text-sm mt-2">
            A integração com Google Calendar será implementada na próxima versão.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;

/**
 * DatePicker Component
 *
 * Componente de seleção de data com comportamento inteligente:
 * - Se nenhuma data for fornecida, usa a data atual automaticamente
 * - Formato de exibição: DD/MM/YYYY
 * - Permite navegação por teclado
 * - Destaca visualmente a data de hoje
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date>();
 *
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   placeholder="Selecione uma data"
 * />
 * ```
 */

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  /**
   * Data selecionada. Se undefined, usa a data atual ao selecionar.
   */
  value?: Date;

  /**
   * Callback chamado quando a data é alterada.
   */
  onChange?: (date: Date | undefined) => void;

  /**
   * Texto do placeholder quando nenhuma data está selecionada.
   * @default "Selecione uma data"
   */
  placeholder?: string;

  /**
   * Se true, o campo fica desabilitado.
   */
  disabled?: boolean;

  /**
   * Classes CSS adicionais para o botão.
   */
  className?: string;

  /**
   * Se true, usa a data atual como valor inicial quando o valor é undefined.
   * @default false
   */
  defaultToToday?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  defaultToToday = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Determina a data a ser exibida
  const displayDate = React.useMemo(() => {
    if (value) return value;
    if (defaultToToday) return new Date();
    return undefined;
  }, [value, defaultToToday]);

  const handleSelect = (date: Date | undefined) => {
    // Se nenhuma data foi selecionada mas defaultToToday está ativo, usa hoje
    const selectedDate = date || (defaultToToday ? new Date() : undefined);
    onChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate ? (
            format(displayDate, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

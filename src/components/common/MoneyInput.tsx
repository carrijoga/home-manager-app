import { ChangeEvent,useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

interface MoneyInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  allowNegative?: boolean;
}

export default function MoneyInput({
  value,
  onChange,
  placeholder = 'R$ 0,00',
  className,
  disabled,
  id,
  allowNegative = false,
}: MoneyInputProps) {
  const formatToBRL = (val: number | null) => {
    if (val === null) return '';
    const isNegative = val < 0;
    const absoluteVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absoluteVal);

    return isNegative ? `-R$ ${formatted}` : `R$ ${formatted}`;
  };

  const [displayValue, setDisplayValue] = useState(() => formatToBRL(value));

  useEffect(() => {
    setDisplayValue(formatToBRL(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (!inputValue) {
      onChange(null);
      return;
    }

    const isNegative = allowNegative && inputValue.includes('-');
    const numericString = inputValue.replace(/\D/g, '');

    if (!numericString) {
      onChange(null);
      return;
    }

    let num = parseInt(numericString, 10) / 100;

    if (isNegative) {
      num = -num;
    }

    onChange(num);
  };

  return (
    <Input
      id={id}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      inputMode="numeric"
    />
  );
}

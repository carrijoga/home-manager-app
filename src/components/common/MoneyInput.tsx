import { type NumberFormatValues,NumericFormat } from 'react-number-format';

import Input from './Input';

interface MoneyInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export default function MoneyInput({ value, onChange, placeholder = '0,00', className, disabled, id }: MoneyInputProps) {
  return (
    <NumericFormat
      id={id}
      prefix="R$ "
      decimalSeparator=","
      thousandSeparator="."
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      customInput={Input}
      value={value ?? ''}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      onValueChange={(v: NumberFormatValues) => onChange(v.floatValue ?? null)}
    />
  );
}

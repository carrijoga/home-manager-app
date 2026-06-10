import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

import { PRIORITIES } from './constants';

interface TaskInlineAddProps {
  onAdd: (title: string, priority: number) => Promise<void>;
  disabled?: boolean;
}

export function TaskInlineAdd({ onAdd, disabled }: TaskInlineAddProps) {
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState('3');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
      return;
    }
    if (e.key !== 'Enter' || !value.trim() || loading) return;
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(value.trim(), Number(priority));
      setValue('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-colors ${
      focused
        ? 'border-primary bg-card shadow-sm'
        : 'border-dashed border-border bg-transparent hover:border-muted-foreground/40'
    }`}>
      <Plus size={14} className="text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Adicionar tarefa..."
        disabled={disabled || loading}
        maxLength={200}
        className="flex-1 bg-transparent font-ui text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
      />
      {focused && (
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="h-7 w-[100px] text-xs rounded-full border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map(p => (
              <SelectItem key={p.value} value={p.value} className="text-xs">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

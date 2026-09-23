import { Input } from '@/components/ui/input';
import { CATEGORY_COLORS, CATEGORY_EMOJIS, isHexColor, isSingleEmoji } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { CategoryScope } from '@/schemas/category';

export function EmojiPicker({
  scope,
  value,
  onChange,
}: {
  scope: CategoryScope;
  value: string;
  onChange: (v: string) => void;
}) {
  const invalid = value !== '' && !isSingleEmoji(value);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {CATEGORY_EMOJIS[scope].map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Ícone ${emoji}`}
            aria-pressed={value === emoji}
            onClick={() => onChange(emoji)}
            className={cn(
              'flex aspect-square items-center justify-center rounded-lg border text-lg transition-colors hover:bg-accent',
              value === emoji ? 'border-primary bg-primary/10' : 'border-border/50'
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="Ou cole um emoji"
        aria-invalid={invalid}
        className="w-40"
      />
      {invalid && <p className="text-xs text-destructive">Use exatamente um emoji.</p>}
    </div>
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const invalid = value !== '' && !isHexColor(value);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Cor ${color}`}
            aria-pressed={value.toUpperCase() === color}
            onClick={() => onChange(color)}
            className={cn(
              'size-7 rounded-full border-2 transition-transform hover:scale-110',
              value.toUpperCase() === color ? 'border-foreground' : 'border-transparent'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="#RRGGBB"
        aria-invalid={invalid}
        className="w-32 font-mono"
      />
      {invalid && <p className="text-xs text-destructive">Use o formato #RRGGBB.</p>}
    </div>
  );
}

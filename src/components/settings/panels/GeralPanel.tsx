import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Label } from '@/components/ui';

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português (BR)', available: true },
  { value: 'en', label: 'English', available: false },
  { value: 'es', label: 'Español', available: false },
];

export function GeralPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Geral</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configurações gerais do aplicativo.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="language-select">Idioma</Label>
        <Select defaultValue="pt-BR">
          <SelectTrigger id="language-select" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(({ value, label, available }) => (
              <SelectItem key={value} value={value} disabled={!available}>
                <span className="flex items-center gap-2">
                  {label}
                  {!available && (
                    <Badge variant="secondary" className="text-xs">Em breve</Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

import { toast } from 'sonner';

import {
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type { SupportedLanguage } from '@/i18n/types';
import { updateUserLocale } from '@/services/settingsService';
import { resolveErrorMessage } from '@/utils/errorUtils';

export function GeralPanel() {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'América/São Paulo';
  const { t, language, setLanguage } = useTranslation();

  const handleLanguageChange = async (value: string) => {
    const lang = value as SupportedLanguage;
    setLanguage(lang);

    try {
      await updateUserLocale(lang);
      toast.success(t('settings.general.languageUpdated'));
    } catch (err) {
      toast.error(resolveErrorMessage(err, t('settings.general.languageSyncError')));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          {t('settings.general.heroTag')}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          {t('settings.general.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('settings.general.description')}
        </p>
      </div>

      {/* Language Section Card */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t('settings.general.languageTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('settings.general.languageDescription')}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="language-select"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {t('settings.general.languageLabel')}
          </Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger
              id="language-select"
              className="w-full sm:w-72 bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(({ value, label, nativeLabel, available }) => (
                <SelectItem key={value} value={value} disabled={!available}>
                  <span className="flex items-center gap-2">
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">({nativeLabel})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Timezone Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('settings.general.timezoneTitle')}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('settings.general.timezoneDescription')}
            </p>
          </div>
          <Badge variant="secondary" className="rounded-md text-[10px]">
            {t('common.automatic')}
          </Badge>
        </div>
        <div className="rounded-xl border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground">
          {t('settings.general.detectedTimezone')}:{' '}
          <span className="font-semibold text-foreground">{userTimeZone}</span>
        </div>
      </section>
    </div>
  );
}


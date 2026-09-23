import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

import { useTheme } from '@/contexts/ThemeContext';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme();

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      position="bottom-right"
      closeButton
      visibleToasts={3}
      duration={4000}
      gap={12}
      icons={{
        success: <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />,
        error: <XCircle className="size-5 text-rose-500 shrink-0" />,
        warning: <AlertTriangle className="size-5 text-amber-500 shrink-0" />,
        info: <Info className="size-5 text-blue-500 shrink-0" />,
        loading: <Loader2 className="size-5 text-primary animate-spin shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast !font-sans !rounded-2xl !border !border-border ' +
            '!shadow-xl !shadow-black/[0.05] dark:!shadow-black/50 !p-3.5 !pr-10 !gap-3 ' +
            '!w-full sm:!w-[370px] !max-w-[calc(100vw-24px)] ' +
            'group-[.toaster]:!bg-card ' +
            'group-[.toaster]:!text-card-foreground',
          title: '!font-semibold !text-xs sm:!text-[13px] !text-foreground !leading-snug',
          description:
            'group-[.toast]:!text-muted-foreground !text-xs !mt-0.5 !leading-relaxed',
          closeButton:
            '!left-auto !right-2.5 !top-1/2 !-translate-y-1/2 ' +
            '!bg-transparent hover:!bg-muted ' +
            '!border-0 !text-muted-foreground hover:!text-foreground ' +
            '!transition-colors !rounded-lg !size-7 sm:!size-6 !flex !items-center !justify-center',
          actionButton:
            '!text-xs !font-semibold !rounded-xl !px-3 !py-1.5 !transition-all ' +
            '!bg-primary hover:!bg-primary/90 !text-primary-foreground shadow-sm active:scale-[0.98]',
          cancelButton:
            '!text-xs !font-medium !rounded-xl !px-3 !py-1.5 !transition-colors ' +
            '!bg-secondary hover:!bg-secondary/80 !text-secondary-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

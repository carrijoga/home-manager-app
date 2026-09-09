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
      visibleToasts={4}
      gap={8}
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />,
        error: <XCircle className="size-4 text-rose-500 shrink-0" />,
        warning: <AlertTriangle className="size-4 text-amber-500 shrink-0" />,
        info: <Info className="size-4 text-blue-500 shrink-0" />,
        loading: <Loader2 className="size-4 text-slate-400 animate-spin shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast !font-sans !rounded-xl !border !border-slate-200/80 dark:!border-slate-800 ' +
            '!shadow-lg !shadow-black/[0.04] dark:!shadow-black/40 !p-3.5 !pr-9.5 !gap-3 ' +
            '!w-full sm:!w-[356px] !max-w-[calc(100vw-24px)] ' +
            'group-[.toaster]:!bg-white dark:group-[.toaster]:!bg-slate-900 ' +
            'group-[.toaster]:!text-slate-900 dark:group-[.toaster]:!text-slate-100',
          title: '!font-medium !text-xs sm:!text-sm !text-slate-900 dark:!text-slate-100 !leading-snug',
          description:
            'group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400 !text-xs !mt-0.5 !leading-relaxed',
          closeButton:
            '!left-auto !right-2.5 !top-1/2 !-translate-y-1/2 ' +
            '!bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-800 ' +
            '!border-0 !text-slate-400 hover:!text-slate-700 dark:hover:!text-slate-200 ' +
            '!transition-colors !rounded-lg !size-7 sm:!size-6 !flex !items-center !justify-center',
          actionButton:
            '!text-xs !font-medium !rounded-lg !px-3 sm:!px-2.5 !py-1.5 sm:!py-1 !transition-opacity ' +
            '!bg-slate-900 !text-white hover:!opacity-90 ' +
            'dark:!bg-slate-100 dark:!text-slate-900',
          cancelButton:
            '!text-xs !font-medium !rounded-lg !px-3 sm:!px-2.5 !py-1.5 sm:!py-1 !transition-colors ' +
            '!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 hover:!bg-slate-200 dark:hover:!bg-slate-700',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

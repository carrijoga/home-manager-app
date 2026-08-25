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
      // closeButton
      visibleToasts={3}
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            'group toast !font-sans !rounded-xl !border !shadow-lg !shadow-black/[0.06] !px-4 !py-3 ' +
            'group-[.toaster]:bg-white group-[.toaster]:text-slate-800 group-[.toaster]:border-slate-200/80 ' +
            'dark:group-[.toaster]:bg-slate-900 dark:group-[.toaster]:text-slate-100 dark:group-[.toaster]:border-slate-700/60',
          title: '!font-semibold !text-sm',
          description:
            'group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400 !text-xs !mt-0.5',
          // closeButton:
          //   "!bg-transparent !border-0 !text-slate-400 hover:!text-slate-700 dark:hover:!text-slate-200 !transition-colors",
          success:
            'group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-emerald-500 ' +
            'group-[.toaster]:!bg-white group-[.toaster]:!text-slate-800 group-[.toaster]:!border-slate-200/80 ' +
            'dark:group-[.toaster]:!bg-slate-900 dark:group-[.toaster]:!text-slate-100 dark:group-[.toaster]:!border-l-emerald-400 dark:group-[.toaster]:!border-slate-700/60',
          error:
            'group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-rose-500 ' +
            'group-[.toaster]:!bg-white group-[.toaster]:!text-slate-800 group-[.toaster]:!border-slate-200/80 ' +
            'dark:group-[.toaster]:!bg-slate-900 dark:group-[.toaster]:!text-slate-100 dark:group-[.toaster]:!border-l-rose-400 dark:group-[.toaster]:!border-slate-700/60',
          warning:
            'group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-amber-400 ' +
            'group-[.toaster]:!bg-white group-[.toaster]:!text-slate-800 group-[.toaster]:!border-slate-200/80 ' +
            'dark:group-[.toaster]:!bg-slate-900 dark:group-[.toaster]:!text-slate-100 dark:group-[.toaster]:!border-l-amber-300 dark:group-[.toaster]:!border-slate-700/60',
          info:
            'group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-indigo-500 ' +
            'group-[.toaster]:!bg-white group-[.toaster]:!text-slate-800 group-[.toaster]:!border-slate-200/80 ' +
            'dark:group-[.toaster]:!bg-slate-900 dark:group-[.toaster]:!text-slate-100 dark:group-[.toaster]:!border-l-indigo-400 dark:group-[.toaster]:!border-slate-700/60',
          actionButton:
            '!text-xs !font-semibold !rounded-lg !px-3 !py-1.5 ' +
            '!bg-slate-100 !text-slate-700 hover:!bg-slate-200 ' +
            'dark:!bg-slate-800 dark:!text-slate-200 dark:hover:!bg-slate-700',
          cancelButton:
            '!text-xs !rounded-lg !px-3 !py-1.5 ' +
            '!bg-transparent !text-slate-500 hover:!text-slate-700 ' +
            'dark:!text-slate-400 dark:hover:!text-slate-200',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

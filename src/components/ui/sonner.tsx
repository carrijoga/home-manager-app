import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme();

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-xl dark:group-[.toaster]:bg-slate-800 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-700",
          description:
            "group-[.toast]:text-slate-600 dark:group-[.toast]:text-slate-400",
          actionButton:
            "!bg-white/20 !text-white !border !border-white/30 hover:!bg-white/30 !font-semibold",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 dark:group-[.toast]:bg-slate-700 dark:group-[.toast]:text-slate-300",
          success:
            "group-[.toaster]:!bg-emerald-600 group-[.toaster]:!text-white group-[.toaster]:!border-emerald-700 dark:group-[.toaster]:!bg-emerald-500 dark:group-[.toaster]:!border-emerald-600",
          error:
            "group-[.toaster]:!bg-rose-600 group-[.toaster]:!text-white group-[.toaster]:!border-rose-700 dark:group-[.toaster]:!bg-rose-500 dark:group-[.toaster]:!border-rose-600",
          warning:
            "group-[.toaster]:!bg-amber-500 group-[.toaster]:!text-white group-[.toaster]:!border-amber-600 dark:group-[.toaster]:!bg-amber-400 dark:group-[.toaster]:!border-amber-500",
          info: "group-[.toaster]:!bg-cyan-500 group-[.toaster]:!text-white group-[.toaster]:!border-cyan-600 dark:group-[.toaster]:!bg-cyan-400 dark:group-[.toaster]:!border-cyan-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

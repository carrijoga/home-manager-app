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
            "group-[.toast]:bg-indigo-600 group-[.toast]:text-white dark:group-[.toast]:bg-indigo-500",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 dark:group-[.toast]:bg-slate-700 dark:group-[.toast]:text-slate-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

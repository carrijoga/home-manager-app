import { useToastNotifications } from "@/hooks/use-toast-notifications";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Toggle para habilitar/desabilitar sons dos toasts
 */
export const ToastSoundToggle = () => {
  const { enableSound, disableSound, isSoundEnabled } = useToastNotifications();
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, [isSoundEnabled]);

  const handleToggle = () => {
    if (soundEnabled) {
      disableSound();
      setSoundEnabled(false);
    } else {
      enableSound();
      setSoundEnabled(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      title={soundEnabled ? "Desativar sons" : "Ativar sons"}
    >
      {soundEnabled ? (
        <>
          <Volume2 size={20} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Sons Ativos
          </span>
        </>
      ) : (
        <>
          <VolumeX size={20} className="text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Sons Desativados
          </span>
        </>
      )}
    </button>
  );
};

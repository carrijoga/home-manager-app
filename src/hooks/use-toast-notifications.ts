import { toast } from "sonner";

/**
 * Cache de áudios pré-carregados
 */
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Cria sons usando data URLs (base64) - sons curtos e agradáveis
 */
const createAudioData = (
  type: 'success-add' | 'success-update' | 'success-delete' | 'error' | 'warning' | 'info'
): string => {
  // Frequências otimizadas para cada tipo (notas musicais)
  const configs: Record<string, { freq1: number; freq2: number; freq3?: number; duration: number }> = {
    'success-add': { freq1: 523.25, freq2: 659.25, freq3: 783.99, duration: 0.18 }, // C5 + E5 + G5 (acorde maior ascendente)
    'success-update': { freq1: 523.25, freq2: 698.46, duration: 0.15 }, // C5 + F5 (quinta perfeita)
    'success-delete': { freq1: 659.25, freq2: 523.25, duration: 0.16 }, // E5 + C5 (descendente)
    'error': { freq1: 466.16, freq2: 415.30, duration: 0.20 }, // Bb4 + Ab4 (dissonante)
    'warning': { freq1: 587.33, freq2: 587.33, duration: 0.18 }, // D5 (neutro)
    'info': { freq1: 698.46, freq2: 698.46, duration: 0.12 }, // F5 (suave)
  };

  const config = configs[type];

  // AudioContext offline para gerar áudio
  const sampleRate = 44100;
  const duration = config.duration;
  const numSamples = Math.floor(sampleRate * duration);

  // Criar buffer de áudio
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Envelope ADSR suave
    let envelope = 1;
    const attackTime = 0.01;
    const releaseTime = 0.08;

    if (t < attackTime) {
      envelope = t / attackTime;
    } else if (t > duration - releaseTime) {
      envelope = (duration - t) / releaseTime;
    }

    let sample = 0;

    // Success Add - 3 notas ascendentes (C E G)
    if (type === 'success-add') {
      if (t < 0.06) {
        sample = Math.sin(2 * Math.PI * config.freq1 * t) * envelope * 0.3;
      } else if (t < 0.12) {
        sample = Math.sin(2 * Math.PI * config.freq2 * (t - 0.06)) * envelope * 0.3;
      } else {
        sample = Math.sin(2 * Math.PI * (config.freq3 || 0) * (t - 0.12)) * envelope * 0.3;
      }
    }
    // Success Update - 2 notas harmônicas
    else if (type === 'success-update') {
      if (t < 0.08) {
        sample = Math.sin(2 * Math.PI * config.freq1 * t) * envelope * 0.3;
      } else {
        sample = Math.sin(2 * Math.PI * config.freq2 * (t - 0.08)) * envelope * 0.3;
      }
    }
    // Success Delete - 2 notas descendentes
    else if (type === 'success-delete') {
      if (t < 0.08) {
        sample = Math.sin(2 * Math.PI * config.freq1 * t) * envelope * 0.3;
      } else {
        sample = Math.sin(2 * Math.PI * config.freq2 * (t - 0.08)) * envelope * 0.3;
      }
    }
    // Error - dissonância descendente
    else if (type === 'error') {
      if (t < 0.1) {
        sample = Math.sin(2 * Math.PI * config.freq1 * t) * envelope * 0.25;
      } else {
        sample = Math.sin(2 * Math.PI * config.freq2 * (t - 0.1)) * envelope * 0.25;
      }
    }
    // Warning e Info - tom único
    else {
      sample = Math.sin(2 * Math.PI * config.freq1 * t) * envelope * 0.28;
    }

    buffer[i] = sample;
  }

  // Converter para WAV
  const wavData = createWavBlob(buffer, sampleRate);
  return URL.createObjectURL(wavData);
};

/**
 * Cria um blob WAV a partir de dados de áudio
 */
const createWavBlob = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Samples
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset + i * 2, sample * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Sons para notificações (opcionais)
 */
const playSound = (
  type: 'success-add' | 'success-update' | 'success-delete' | 'error' | 'warning' | 'info'
) => {
  // Verifica se o áudio está habilitado nas preferências do usuário
  const soundEnabled = localStorage.getItem('toast-sound-enabled') === 'true';
  if (!soundEnabled) return;

  try {
    // Usa cache ou cria novo áudio
    let audio = audioCache.get(type);

    if (!audio) {
      const dataUrl = createAudioData(type);
      audio = new Audio(dataUrl);
      audio.volume = 0.4;
      audioCache.set(type, audio);
    }

    // Clone o áudio para permitir múltiplas reproduções simultâneas
    const audioClone = audio.cloneNode() as HTMLAudioElement;
    audioClone.volume = 0.4;
    audioClone.play().catch(() => {
      // Ignora erros de reprodução (autoplay bloqueado, etc)
    });
  } catch (error) {
    // Ignora erros de áudio silenciosamente
    console.debug('Toast sound error:', error);
  }
};

interface ToastOptions {
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
  playSound?: boolean;
  soundVariant?: 'add' | 'update' | 'delete';
}

/**
 * Hook customizado para notificações toast com mensagens padrão em português
 */
export const useToastNotifications = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    const duration = options?.persistent ? Infinity : (options?.duration ?? 3000);

    if (options?.playSound !== false) {
      const soundType = options?.soundVariant
        ? `success-${options.soundVariant}` as const
        : 'success-add';
      playSound(soundType);
    }

    toast.success(message, {
      duration,
      action: options?.action,
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    const duration = options?.persistent ? Infinity : (options?.duration ?? 3000);

    if (options?.playSound !== false) {
      playSound('error');
    }

    toast.error(message, {
      duration,
      action: options?.action,
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    const duration = options?.persistent ? Infinity : (options?.duration ?? 3000);

    if (options?.playSound !== false) {
      playSound('warning');
    }

    toast.warning(message, {
      duration,
      action: options?.action,
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    const duration = options?.persistent ? Infinity : (options?.duration ?? 3000);

    if (options?.playSound !== false) {
      playSound('info');
    }

    toast.info(message, {
      duration,
      action: options?.action,
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId);
  };

  const enableSound = () => {
    localStorage.setItem('toast-sound-enabled', 'true');
  };

  const disableSound = () => {
    localStorage.setItem('toast-sound-enabled', 'false');
  };

  const isSoundEnabled = () => {
    return localStorage.getItem('toast-sound-enabled') === 'true';
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissToast,
    enableSound,
    disableSound,
    isSoundEnabled,
  };
};

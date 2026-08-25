export const NOTIFICATION_PREFERENCES_STORAGE_KEY = 'ninho-notification-preferences';
export const NOTIFICATION_PREFERENCES_UPDATED_EVENT = 'notification:preferences-updated';

export interface NotificationPreferences {
  info: boolean;
  warning: boolean;
  error: boolean;
  success: boolean;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  info: true,
  warning: true,
  error: true,
  success: true,
};

export function getNotificationPreferences(): NotificationPreferences {
  const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);

  if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;

    return {
      info: typeof parsed.info === 'boolean' ? parsed.info : DEFAULT_NOTIFICATION_PREFERENCES.info,
      warning:
        typeof parsed.warning === 'boolean'
          ? parsed.warning
          : DEFAULT_NOTIFICATION_PREFERENCES.warning,
      error:
        typeof parsed.error === 'boolean' ? parsed.error : DEFAULT_NOTIFICATION_PREFERENCES.error,
      success:
        typeof parsed.success === 'boolean'
          ? parsed.success
          : DEFAULT_NOTIFICATION_PREFERENCES.success,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export function saveNotificationPreferences(
  next: Partial<NotificationPreferences>
): NotificationPreferences {
  const current = getNotificationPreferences();
  const merged: NotificationPreferences = {
    info: typeof next.info === 'boolean' ? next.info : current.info,
    warning: typeof next.warning === 'boolean' ? next.warning : current.warning,
    error: typeof next.error === 'boolean' ? next.error : current.error,
    success: typeof next.success === 'boolean' ? next.success : current.success,
  };

  localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(NOTIFICATION_PREFERENCES_UPDATED_EVENT));

  return merged;
}

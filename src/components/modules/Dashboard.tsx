import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, DollarSign, ShoppingCart } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  AnimatedCurrency,
  AnimatedNumber,
  AnimatedPercent,
} from '@/components/common/AnimatedNumber';
import BulletinBoard, { type BulletinNote } from '@/components/common/BulletinBoard';
import DashboardHeader from '@/components/common/DashboardHeader';
import ModuleMetricWidget, { type FooterItem } from '@/components/common/ModuleMetricWidget';
import UpcomingEvents from '@/components/common/UpcomingEvents';
import { CreateNoteModal } from '@/components/modals/CreateNoteModal';
import { NoticeHistoryModal } from '@/components/modals/NoticeHistoryModal';
import { useApp } from '@/contexts/AppContext';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { useNestPresence } from '@/hooks/useNestPresence';
import { useSignalR } from '@/hooks/useSignalR';
import {
  getWeatherPreferences,
  saveWeatherPreferences,
  WEATHER_PREFERENCES_UPDATED_EVENT,
} from '@/lib/weatherPreferences';
import type { DashboardResponse } from '@/schemas/dashboard';
import type { NestMember } from '@/schemas/nest';
import { DATA_MODE } from '@/services/api/config';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CalendarEventPreview } from '@/services/calendarService';
import * as calendarService from '@/services/calendarService';
import * as dashboardService from '@/services/dashboardService';
import * as nestService from '@/services/nestService';
import * as noticeService from '@/services/noticeService';
import * as weatherService from '@/services/weatherService';
import type { Notice } from '@/types';
import { ApiPriority } from '@/types';

function formatRelativeNoticeTime(dateValue: string | Date | undefined): string | undefined {
  if (!dateValue) return undefined;
  const createdAt = new Date(dateValue);

  if (Number.isNaN(createdAt.getTime())) return undefined;

  const diffMs = Date.now() - createdAt.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) return 'agora mesmo';

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `há ${minutes} minuto${minutes === 1 ? '' : 's'}`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `há ${hours} hora${hours === 1 ? '' : 's'}`;
  }

  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `há ${days} dia${days === 1 ? '' : 's'}`;
  }

  if (diffMs < month) {
    const weeks = Math.floor(diffMs / week);
    return `há ${weeks} semana${weeks === 1 ? '' : 's'}`;
  }

  if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return `há ${months} mês${months === 1 ? '' : 'es'}`;
  }

  const years = Math.floor(diffMs / year);
  return `há ${years} ano${years === 1 ? '' : 's'}`;
}

const isMockMode = DATA_MODE === 'mock';

interface WeatherState {
  loading: boolean;
  error: boolean;
  city: string;
  description: string;
  temperatureLabel: string;
  conditionCode: string | null | undefined;
  temperature: number | null;
  visible: boolean;
}

interface EditingNoteState {
  id: string;
  message: string;
  priority: ApiPriority;
}

/**
 * Dashboard — Visão geral da casa (Domestic Sanctuary design)
 */
export const Dashboard: FC = () => {
  const navigate = useNavigate();
  const { user, activeNestId } = useApp();
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<EditingNoteState | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [weatherState, setWeatherState] = useState<WeatherState>({
    loading: false,
    error: false,
    city: '',
    description: '',
    temperatureLabel: '--',
    conditionCode: null,
    temperature: null,
    visible: false,
  });
  const [weatherOnboardingKey, setWeatherOnboardingKey] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventPreview[]>([]);
  const [members, setMembers] = useState<NestMember[]>([]);
  const [apiDashboard, setApiDashboard] = useState<DashboardResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(!isMockMode);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { presence: onlinePresences } = useNestPresence({
    nestId: activeNestId,
    intervalMs: 30000,
  });

  const displayMembers = useMemo(() => {
    return nestService.mergeMembersPresence(members, onlinePresences);
  }, [members, onlinePresences]);

  const currentNest = user?.nests?.find((n) => n.nestId === activeNestId);
  const currentUserRole = currentNest?.role ?? (isMockMode ? 1 : 3);
  const isOwnerOrAdmin = isMockMode || currentUserRole === 1 || currentUserRole === 2;

  // ── Notices locais ─────────────────────────────────────────────────────────
  const refreshNotices = useCallback(async () => {
    if (!activeNestId && !isMockMode) return;
    try {
      const data = await noticeService.getActiveNotices(activeNestId ?? undefined);
      setNotices(data);
    } catch (_err) {
      // Silencioso em caso de erro ao buscar recados locais
    }
  }, [activeNestId]);

  useEffect(() => {
    refreshNotices();
  }, [refreshNotices]);

  const formatEventDateLabel = useCallback((startsAt?: string | null) => {
    if (!startsAt) return 'Em breve';
    const date = new Date(startsAt);
    if (Number.isNaN(date.getTime())) return 'Em breve';

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEvent = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round(
      (startOfEvent.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000)
    );

    const timeLabel = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

    if (dayDiff === 0) return `Hoje • ${timeLabel}`;
    if (dayDiff === 1) return `Amanhã • ${timeLabel}`;

    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
      .format(date)
      .replace('.', '');
    return `${weekday} • ${timeLabel}`;
  }, []);

  const loadWeather = useCallback(async () => {
    const prefs = getWeatherPreferences();
    const manualCity = prefs.manualCity.trim();
    const canUseGeo = prefs.consentGiven && Boolean(prefs.coords);
    const canUseApproximate = prefs.consentGiven && prefs.useApproximateLocation;
    const shouldShow = isMockMode || Boolean(manualCity || canUseGeo || canUseApproximate);

    if (!shouldShow) {
      setWeatherState((prev) => ({ ...prev, visible: false, loading: false }));
      return;
    }

    setWeatherState((prev) => ({ ...prev, visible: true, loading: true, error: false }));

    try {
      const weather = await weatherService.getMyWeather(
        manualCity
          ? { city: manualCity, source: 'manual' }
          : canUseGeo && prefs.coords
            ? {
                latitude: prefs.coords.latitude,
                longitude: prefs.coords.longitude,
                source: 'gps',
              }
            : { source: 'ip' }
      );

      setWeatherState({
        loading: false,
        error: false,
        visible: true,
        city: weather.city,
        description: weather.description,
        temperatureLabel: `${Math.round(weather.temperature)}°C`,
        conditionCode: weather.conditionCode ?? null,
        temperature: weather.temperature,
      });
    } catch (_err) {
      setWeatherState((prev) => ({ ...prev, loading: false, error: true }));
    }
  }, []);

  const handleEnableWeather = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('Seu navegador não suporta geolocalização.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveWeatherPreferences({
          consentGiven: true,
          method: 'gps',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        loadWeather();
      },
      () => {
        toast.error('Não foi possível obter sua localização.');
        setWeatherOnboardingKey((k) => k + 1);
      },
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  }, [loadWeather]);

  useEffect(() => {
    loadWeather();

    const onWeatherPreferencesUpdated = () => {
      loadWeather();
    };

    window.addEventListener(WEATHER_PREFERENCES_UPDATED_EVENT, onWeatherPreferencesUpdated);

    return () => {
      window.removeEventListener(WEATHER_PREFERENCES_UPDATED_EVENT, onWeatherPreferencesUpdated);
    };
  }, [loadWeather]);

  useEffect(() => {
    let isMounted = true;

    const loadUpcomingEvents = async () => {
      const events = await calendarService.getUpcomingEvents(4);
      if (isMounted) setCalendarEvents(events);
    };

    loadUpcomingEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeNestId && !isMockMode) {
      setIsLoadingDashboard(false);
      return;
    }
    let isMounted = true;
    setIsLoadingDashboard(true);

    dashboardService
      .getDashboard(activeNestId ?? undefined)
      .then((data) => {
        if (isMounted) setApiDashboard(data);
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.error('[Dashboard] Erro ao carregar dados do dashboard:', err);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingDashboard(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeNestId]);

  // Carrega membros do ninho
  useEffect(() => {
    if (!activeNestId && !isMockMode) return;
    let isMounted = true;

    nestService
      .getNestMembers(activeNestId ?? '')
      .then((data) => {
        if (isMounted && data) setMembers(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeNestId]);

  // ── Dashboard Realtime (SignalR) ─────────────────────────────────────────
  const hubUrl =
    DATA_MODE !== 'mock' && activeNestId ? ENDPOINTS.dashboardHub(activeNestId) : null;
  const { connectionRef, isConnected } = useSignalR(hubUrl);

  useDashboardRealtime({
    connectionRef,
    isConnected,
    setApiDashboard,
  });

  const handleRefreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [dashData, noticesData, eventsData, membersData] = await Promise.all([
        dashboardService.getDashboard(activeNestId ?? undefined).catch((err) => {
          if (import.meta.env.DEV) console.error('[Dashboard] Erro ao carregar dashboard:', err);
          return null;
        }),
        noticeService.getActiveNotices(activeNestId ?? undefined).catch(() => null),
        calendarService.getUpcomingEvents(4).catch(() => null),
        activeNestId ? nestService.getNestMembers(activeNestId).catch(() => null) : null,
      ]);
      await loadWeather().catch(() => {});

      if (dashData) setApiDashboard(dashData);
      if (noticesData) setNotices(noticesData);
      if (eventsData) setCalendarEvents(eventsData);
      if (membersData) setMembers(membersData);

      toast.success('Dashboard atualizado com sucesso!');
    } catch (_err) {
      toast.error('Erro ao atualizar o dashboard.');
    } finally {
      setIsRefreshing(false);
    }
  }, [activeNestId, loadWeather]);

  // ── Metrics ────────────────────────────────────────────────────────────────

  const expenseMetrics = useMemo(() => {
    if (!apiDashboard) return { current: 0, previous: 0, delta: 0, deltaPercent: 0 };
    const current = apiDashboard.financial?.totalMonthSpent ?? 0;
    const previous = apiDashboard.financial?.totalLastMonthSpent ?? 0;
    const delta = current - previous;
    const deltaPercent =
      previous > 0
        ? Math.abs(delta / previous)
        : apiDashboard.financial?.monthVariation
          ? Math.abs(apiDashboard.financial.monthVariation) / 100
          : 0;
    return { current, previous, delta, deltaPercent };
  }, [apiDashboard]);

  const taskMetrics = useMemo(() => {
    if (!apiDashboard) return { pending: 0, completed: 0, completionRate: 0 };
    const { totalDayTasks = 0, totalDayFinishedTasks = 0, rateTasks = 0 } = apiDashboard.task ?? {};
    return {
      pending: Math.max(0, totalDayTasks - totalDayFinishedTasks),
      completed: totalDayFinishedTasks,
      completionRate: rateTasks,
    };
  }, [apiDashboard]);

  const shoppingMetrics = useMemo(() => {
    if (!apiDashboard) return { pending: 0, estimatedValue: 0, outOfStockAlerts: 0 };
    return {
      pending: apiDashboard.shoppingList?.totalMonthItems ?? 0,
      estimatedValue: apiDashboard.shoppingList?.totalMonthEstimatedValue ?? 0,
      outOfStockAlerts: 0,
    };
  }, [apiDashboard]);

  const bulletinNotes = useMemo((): BulletinNote[] => {
    const rawList: Notice[] =
      notices && notices.length > 0
        ? notices
        : (apiDashboard?.notices ?? []).map((n) => ({
            noticeId: n.noticeId,
            message: n.message,
            date: n.date,
            isPinned: Boolean(n.isPinned),
            priority: ApiPriority.Baixa,
            expiresAt: n.expiresAt ?? null,
            isActive: n.isActive,
            createdBy: n.createdBy ?? '',
            createdAt: n.createdAt,
            reactions: (n.reactions ?? []).map((r) => ({
              reactionId: r.noticeReactionId,
              noticeId: r.noticeId,
              userId: r.userId,
              emoji: r.emoji,
              createdAt: r.createdAt,
            })),
          }));

    const activeList = rawList.filter(
      (n) =>
        n.isActive !== false &&
        (n.isPinned || !noticeService.isCreatedInPastDays(n.createdAt || n.date))
    );

    const sorted = noticeService.sortNotices(activeList);

    return sorted.slice(0, 6).map((n) => ({
      id: n.noticeId,
      priority: n.priority ?? ApiPriority.Baixa,
      content: n.message,
      isPinned: Boolean(n.isPinned),
      createdBy: n.createdBy,
      authorName: n.authorName,
      authorAvatar: n.authorAvatar,
      createdAt: n.createdAt || n.date,
      timeLabel:
        n.createdAt || n.date ? formatRelativeNoticeTime(n.createdAt || n.date) : undefined,
      reactions: n.reactions ?? [],
    }));
  }, [notices, apiDashboard]);

  const upcomingEvents = useMemo(() => {
    if (!isMockMode && apiDashboard?.events?.length) {
      return apiDashboard.events.map((event, index) => ({
        id: `api-event-${index}`,
        title: event.title,
        location: event.description ?? undefined,
        dateLabel: formatEventDateLabel(event.date),
        isNext: index === 0,
      }));
    }
    return calendarEvents.map((event, index) => ({
      id: event.id,
      title: event.title,
      location: event.location,
      dateLabel: formatEventDateLabel(event.startsAt),
      isNext: index === 0,
    }));
  }, [calendarEvents, apiDashboard, formatEventDateLabel]);

  // ── Agenda event count for metric widget ──────────────────────────────────
  const agendaCount =
    !isMockMode && apiDashboard
      ? (apiDashboard.event?.totalWeekEvents ?? 0)
      : upcomingEvents.length;

  const nextEventPreview = upcomingEvents[0]
    ? `${upcomingEvents[0].dateLabel.split('•')[1]?.trim() ?? ''} ${upcomingEvents[0].title}`
    : !isMockMode && apiDashboard?.event?.nextEventName
      ? apiDashboard.event.nextEventName
      : null;

  // ── Notice actions locais ──────────────────────────────────────────────────
  const handleSaveNotice = async (message: string, noteId?: string, priority: ApiPriority = ApiPriority.Baixa) => {
    if (noteId) {
      await noticeService.updateNotice(noteId, { message, priority }, activeNestId ?? undefined);
    } else {
      await noticeService.createNotice(
        { message, priority, date: new Date().toISOString() },
        activeNestId ?? undefined,
        user
          ? {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
            }
          : undefined
      );
    }
    // Ao ser criado (ou editado), o componente faz a busca novamente da lista
    await refreshNotices();
  };

  const handleEditNotice = (bulletinNote: BulletinNote) => {
    setEditingNote({
      id: bulletinNote.id,
      message: String(bulletinNote.content),
      priority: bulletinNote.priority,
    });
    setCreateNoteOpen(true);
  };

  const handleDeleteNotice = async (noteId: string) => {
    try {
      await noticeService.deleteNotice(noteId, activeNestId ?? undefined);
      await refreshNotices();
      toast.success('Recado excluído com sucesso!');
    } catch (_err) {
      toast.error('Erro ao excluir recado.');
    }
  };

  const handleTogglePin = async (noteId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await noticeService.unpinNotice(noteId, activeNestId ?? undefined);
      } else {
        await noticeService.pinNotice(noteId, activeNestId ?? undefined);
      }
      await refreshNotices();
    } catch (_err) {
      // silencioso se a API falhar
    }
  };

  const handleReactToNotice = async (noteId: string, emoji: string) => {
    try {
      await noticeService.reactToNotice(
        noteId,
        emoji,
        activeNestId ?? undefined,
        user
          ? {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
            }
          : undefined
      );
      await refreshNotices();
    } catch (_err) {
      // silencioso
    }
  };

  // ── Animation helpers ────────────────────────────────────────────────────
  const rowVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const cardSlide = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex max-w-full flex-col gap-6 overflow-x-hidden md:gap-10">
      {/* ── Row 0: Header ── */}
      <div data-tour="dashboard-header">
        <DashboardHeader
          userName={user?.callmeby || user?.name || 'Família'}
          currentUserId={user?.id}
          activeNest={currentNest}
          members={displayMembers}
          pendingTasksCount={taskMetrics.pending}
          showWeather={weatherState.visible}
          weatherCity={weatherState.city || 'São Paulo'}
          weatherDescription={weatherState.description || 'Tempo indisponível'}
          weatherTemperatureLabel={weatherState.temperatureLabel}
          weatherConditionCode={weatherState.conditionCode}
          weatherTemperature={weatherState.temperature}
          isWeatherLoading={weatherState.loading}
          isWeatherError={weatherState.error}
          onRefreshWeather={loadWeather}
          onWeatherEnable={handleEnableWeather}
          weatherOnboardingKey={weatherOnboardingKey}
          onRefreshDashboard={handleRefreshDashboard}
          isRefreshingDashboard={isRefreshing}
        />
      </div>

      {/* ── Row 1: Module Metric Widgets com Ícones 3D Personalizados ── */}
      <motion.div
        data-tour="dashboard-metrics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-6 xl:grid-cols-4"
        variants={rowVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            onClick={() => navigate('/financial')}
            iconImage="/icons/clay-optimized/financial_wallet.webp"
            iconAlt="Finanças"
            icon={<DollarSign size={20} strokeWidth={1.5} />}
            iconColor="var(--primary)"
            category="Finanças"
            label="Gasto este mês"
            value={<AnimatedCurrency value={expenseMetrics.current} />}
            isLoading={isLoadingDashboard}
            footer={(
              [
                { label: 'Mês anterior', value: <AnimatedCurrency value={expenseMetrics.previous} /> },
                expenseMetrics.previous > 0
                  ? {
                      label: 'Variação',
                      value: (
                        <AnimatedPercent
                          value={expenseMetrics.deltaPercent * 100}
                          showSign
                        />
                      ),
                      valueColor: expenseMetrics.delta > 0 ? 'var(--destructive)' : 'var(--chart-2)',
                    }
                  : undefined,
              ] as (FooterItem | undefined)[]
            ).filter((item): item is FooterItem => Boolean(item))}
          />
        </motion.div>

        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            onClick={() => navigate('/shopping')}
            iconImage="/icons/clay-optimized/shopping_basket.webp"
            iconAlt="Lista de Compras"
            icon={<ShoppingCart size={20} strokeWidth={1.5} />}
            iconColor="var(--secondary)"
            category="Lista de Compras"
            label="Itens para comprar"
            value={<AnimatedNumber value={shoppingMetrics.pending} suffix=" Itens" />}
            isLoading={isLoadingDashboard}
            footer={(
              [
                { label: 'Custo Est.', value: <AnimatedCurrency value={shoppingMetrics.estimatedValue} /> },
                shoppingMetrics.outOfStockAlerts > 0
                  ? {
                      label: 'Alertas',
                      value: (
                        <AnimatedNumber
                          value={shoppingMetrics.outOfStockAlerts}
                          suffix=" SEM ESTOQUE"
                        />
                      ),
                      valueColor: 'var(--destructive)',
                    }
                  : undefined,
              ] as (FooterItem | undefined)[]
            ).filter((item): item is FooterItem => Boolean(item))}
          />
        </motion.div>

        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            onClick={() => navigate('/tasks')}
            iconImage="/icons/clay-optimized/tasks_clipboard.webp"
            iconAlt="Tarefas"
            icon={<CheckCircle2 size={20} strokeWidth={1.5} />}
            iconColor="var(--chart-2)"
            category="Tarefas"
            label="Suas tarefas hoje"
            value={<AnimatedNumber value={taskMetrics.pending} suffix=" Pendentes" />}
            isLoading={isLoadingDashboard}
            footer={[
              {
                label: 'Finalizadas',
                value: <AnimatedNumber value={taskMetrics.completed} suffix=" Tarefas" />,
              },
              {
                label: 'Ritmo',
                value: <AnimatedPercent value={taskMetrics.completionRate} />,
                valueColor: 'var(--chart-2)',
              },
            ]}
          />
        </motion.div>

        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            onClick={() => navigate('/calendar')}
            iconImage="/icons/clay-optimized/calendar_desk.webp"
            iconAlt="Agenda"
            icon={<Calendar size={20} strokeWidth={1.5} />}
            iconColor="var(--chart-5)"
            category="Agenda"
            label="Esta semana"
            value={<AnimatedNumber value={agendaCount} suffix=" Eventos" />}
            isLoading={isLoadingDashboard}
            footer={nextEventPreview ? [{ label: 'Próximo', value: nextEventPreview }] : undefined}
          />
        </motion.div>
      </motion.div>

      {/* ── Row 2: Mural de Recados + Próximos Eventos ── */}
      <motion.div
        data-tour="dashboard-bulletin"
        className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 items-stretch"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardSlide} className="h-full lg:col-span-2">
          <BulletinBoard
            notes={bulletinNotes}
            currentUserId={user?.id}
            isOwnerOrAdmin={isOwnerOrAdmin}
            onTogglePin={handleTogglePin}
            onCreateNote={() => {
              setEditingNote(null);
              setCreateNoteOpen(true);
            }}
            onEditNote={handleEditNotice}
            onDeleteNote={handleDeleteNotice}
            onReactNote={handleReactToNotice}
            onViewHistory={() => setHistoryOpen(true)}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={cardSlide} className="h-full lg:col-span-1">
          <UpcomingEvents events={upcomingEvents} className="h-full" />
        </motion.div>
      </motion.div>

      <CreateNoteModal
        open={createNoteOpen}
        onClose={() => {
          setCreateNoteOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNotice}
        initialData={editingNote ? { message: editingNote.message, priority: editingNote.priority } : undefined}
      />

      <NoticeHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        nestId={activeNestId ?? undefined}
      />
    </div>
  );
};

export default Dashboard;

import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { getWeatherPreferences, saveWeatherPreferences, WEATHER_PREFERENCES_UPDATED_EVENT } from '@/lib/weatherPreferences';
import { DATA_MODE } from '@/services/api/config';
import * as calendarService from '@/services/calendarService';
import * as goalsService from '@/services/goalsService';
import * as weatherService from '@/services/weatherService';
import { ApiPriority } from '@/types';
import {
  formatCurrency,
  getCurrentMonth,
  getPreviousMonth,
  groupExpensesByMonth,
  groupTasksByMonth,
} from '@/utils/dashboardMetrics';

import BulletinBoard from '../common/BulletinBoard';
import DashboardHeader from '../common/DashboardHeader';
import FamilyGoalCard from '../common/FamilyGoalCard';
import ModuleMetricWidget from '../common/ModuleMetricWidget';
import SpendingByCategory from '../common/SpendingByCategory';
import UpcomingEvents from '../common/UpcomingEvents';


function formatRelativeNoticeTime(dateValue) {
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

/**
 * Dashboard — Visão geral da casa (Domestic Sanctuary design)
 */
const Dashboard = () => {
  const {
    notices,
    tasks,
    shoppingLists,
    expenses,
    user,
    pinNotice,
    unpinNotice,
  } = useApp();
  const [weatherState, setWeatherState] = useState({
    loading: false,
    error: false,
    city: '',
    description: '',
    temperatureLabel: '--',
    visible: false,
  });
  const [familyGoals, setFamilyGoals] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const formatEventDateLabel = useCallback((startsAt) => {
    const date = new Date(startsAt);
    if (Number.isNaN(date.getTime())) return 'Em breve';

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEvent = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round((startOfEvent.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));

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
    const isMockMode = DATA_MODE === 'mock';
    const prefs = getWeatherPreferences();
    const manualCity = prefs.manualCity.trim();
    const canUseGeo = prefs.consentGiven && Boolean(prefs.coords);
    const canUseApproximate = prefs.consentGiven && prefs.useApproximateLocation;
    const shouldShow = isMockMode || Boolean(manualCity || canUseGeo || canUseApproximate);

    if (!shouldShow) {
      setWeatherState(prev => ({ ...prev, visible: false, loading: false }));
      return;
    }

    setWeatherState(prev => ({ ...prev, visible: true, loading: true, error: false }));

    try {
      const weather = await weatherService.getMyWeather(
        manualCity
          ? { city: manualCity, source: 'manual' }
          : canUseGeo
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
      });
    } catch {
      setWeatherState(prev => ({ ...prev, loading: false, error: true }));
    }
  }, []);

  const handleEnableWeather = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('Seu navegador não suporta geolocalização.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
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

    const loadGoals = async () => {
      const goals = await goalsService.getAllGoals();
      if (isMounted) setFamilyGoals(goals);
    };

    loadGoals();

    return () => {
      isMounted = false;
    };
  }, []);

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

  // ── Metrics ────────────────────────────────────────────────────────────────
  const expenseMetrics = useMemo(() => {
    const cur = getCurrentMonth();
    const prev = getPreviousMonth();
    const byMonth = groupExpensesByMonth(expenses);
    const current = byMonth[cur] || 0;
    const previous = byMonth[prev] || 0;
    const delta = current - previous;
    const deltaPercent = previous > 0 ? Math.abs(delta / previous) : 0;
    return { current, previous, delta, deltaPercent };
  }, [expenses]);

  const taskMetrics = useMemo(() => {
    const cur = getCurrentMonth();
    const byMonth = groupTasksByMonth(tasks);
    const stats = byMonth[cur] || { total: 0, completed: 0, completionRate: 0 };
    return {
      pending: tasks.filter(t => !t.isCompleted).length,
      completed: tasks.filter(t => t.isCompleted).length,
      completionRate: stats.completionRate,
    };
  }, [tasks]);

  const shoppingMetrics = useMemo(() => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = now.getMonth() + 1;
    const lists = shoppingLists.filter(l => {
      const d = new Date(l.monthYear);
      return d.getUTCFullYear() === yr && (d.getUTCMonth() + 1) === mo;
    });
    const total = lists.reduce((s, l) => s + l.totalItems, 0);
    const purchased = lists.reduce((s, l) => s + l.purchasedItems, 0);
    // Count items with no estimated price as "sem estoque" alerts
    const outOfStockAlerts = lists.reduce((s, l) => s + (l.outOfStockCount ?? 0), 0);
    return {
      pending: total - purchased,
      estimatedValue: lists.reduce((s, l) => s + (l.totalEstimated ?? 0), 0),
      outOfStockAlerts,
    };
  }, [shoppingLists]);

  const bulletinNotes = useMemo(() =>
    [...notices]
      .filter(n => n.isActive !== false)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 6)
      .map(n => ({
        id: n.noticeId,
        priority: n.isPinned ? ApiPriority.Urgente : n.priority,
        content: n.message,
        isPinned: n.isPinned,
        authorName: n.authorName,
        timeLabel: n.createdAt ? formatRelativeNoticeTime(n.createdAt) : undefined,
        reactions: n.reactions,
      })),
    [notices]
  );

  const upcomingEvents = useMemo(() =>
    calendarEvents.map((event, index) => ({
      id: event.id,
      title: event.title,
      location: event.location,
      dateLabel: formatEventDateLabel(event.startsAt),
      isNext: index === 0,
    })),
  [calendarEvents, formatEventDateLabel]);

  // ── Agenda event count for metric widget ──────────────────────────────────
  const agendaCount = upcomingEvents.length;
  const nextEventPreview = upcomingEvents[0]
    ? `${upcomingEvents[0].dateLabel.split('•')[1]?.trim() ?? ''} ${upcomingEvents[0].title}`
    : null;

  // Spending categories derived from real expense data
  const spendingCategories = useMemo(() => {
    if (!expenses?.length) return [];
    const totals = {};
    expenses.forEach(e => {
      const cat = e.category || 'Outros';
      totals[cat] = (totals[cat] || 0) + (e.value || 0);
    });
    const max = Math.max(...Object.values(totals), 1);
    const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--chart-2)', 'var(--chart-5)'];
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([label, amount], i) => ({
        label,
        amount: formatCurrency(amount),
        ratio: amount / max,
        color: COLORS[i % COLORS.length],
      }));
  }, [expenses]);

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
    <div className="flex flex-col gap-6 md:gap-10 max-w-full overflow-x-hidden">

      {/* ── Row 0: Header ── */}
      <DashboardHeader
        userName={user?.callmeby || user?.name || 'Família'}
        pendingTasksCount={taskMetrics.pending}
        showWeather={weatherState.visible}
        weatherCity={weatherState.city || 'São Paulo'}
        weatherDescription={weatherState.description || 'Tempo indisponível'}
        weatherTemperatureLabel={weatherState.temperatureLabel}
        isWeatherLoading={weatherState.loading}
        isWeatherError={weatherState.error}
        onRefreshWeather={loadWeather}
        onWeatherEnable={handleEnableWeather}
      />

      {/* ── Row 1: Module Metric Widgets ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6"
        variants={rowVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            icon={<DollarSign size={20} strokeWidth={1.5} />}
            iconColor='var(--primary)'
            category="Finanças"
            label="Gasto este mês"
            value={formatCurrency(expenseMetrics.current)}
            footer={[
              { label: 'Mês anterior', value: formatCurrency(expenseMetrics.previous) },
              expenseMetrics.previous > 0
                ? {
                    label: 'Variação',
                    value: `${expenseMetrics.delta >= 0 ? '+' : ''}${(expenseMetrics.deltaPercent * 100).toFixed(0)}%`,
                    valueColor: expenseMetrics.delta > 0 ? 'var(--destructive)' : 'var(--chart-2)',
                  }
                : undefined,
            ].filter(Boolean)}
          />
        </motion.div>

        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            icon={<ShoppingCart size={20} strokeWidth={1.5} />}
            iconColor='var(--secondary)'
            category="Lista de Compras"
            label="Itens para comprar"
            value={`${shoppingMetrics.pending} Itens`}
            footer={[
              { label: 'Custo Est.', value: formatCurrency(shoppingMetrics.estimatedValue) },
              shoppingMetrics.outOfStockAlerts > 0
                ? { label: 'Alertas', value: `${shoppingMetrics.outOfStockAlerts} SEM ESTOQUE`, valueColor: 'var(--destructive)' }
                : undefined,
            ].filter(Boolean)}
          />
        </motion.div>

        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            icon={<CheckCircle2 size={20} strokeWidth={1.5} />}
            iconColor='var(--chart-2)'
            category="Tarefas"
            label="Tarefas de hoje"
            value={`${taskMetrics.pending} Pendentes`}
            footer={[
              { label: 'Finalizadas', value: `${taskMetrics.completed} Tarefas` },
              { label: 'Ritmo', value: `${taskMetrics.completionRate}%`, valueColor: 'var(--chart-2)' },
            ]}
          />
        </motion.div>

        <motion.div variants={cardSlide}>
          <ModuleMetricWidget
            icon={<Calendar size={20} strokeWidth={1.5} />}
            iconColor='var(--chart-5)'
            category="Agenda"
            label="Esta semana"
            value={`${agendaCount} Eventos`}
            footer={nextEventPreview ? [
              { label: 'Próximo', value: nextEventPreview },
            ] : undefined}
          />
        </motion.div>
      </motion.div>

      {/* ── Row 2: Mural de Recados + Próximos Eventos ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardSlide} className="md:col-span-2 lg:col-span-2 h-full">
          <BulletinBoard
            notes={bulletinNotes}
            onTogglePin={async (noteId, isPinned) => {
              if (isPinned) {
                await unpinNotice(noteId);
                return;
              }
              await pinNotice(noteId);
            }}
            onCreateNote={() => {}}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={cardSlide} className="md:col-span-2 lg:col-span-1 h-full">
          <UpcomingEvents events={upcomingEvents} className="h-full" />
        </motion.div>
      </motion.div>

      {/* ── Row 3: Gastos por Categoria + Metas da Família ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardSlide} className="md:col-span-2 lg:col-span-2 h-full">
          <SpendingByCategory categories={spendingCategories} className="h-full" />
        </motion.div>
        <motion.div variants={cardSlide} className="md:col-span-2 lg:col-span-1 h-full">
          <FamilyGoalCard goals={familyGoals} className="h-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

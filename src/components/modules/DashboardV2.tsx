import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CreateNoteModal } from '@/components/modals/CreateNoteModal';
import { NoticeHistoryModal } from '@/components/modals/NoticeHistoryModal';
import { TaskFormModal, type TaskFormPayload } from '@/components/modals/TaskFormModal';
import { TransactionSheet } from '@/components/modals/TransactionSheet';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { useNestPresence } from '@/hooks/useNestPresence';
import { useSignalR } from '@/hooks/useSignalR';
import {
  getWeatherPreferences,
  saveWeatherPreferences,
  WEATHER_PREFERENCES_UPDATED_EVENT,
} from '@/lib/weatherPreferences';
import type { DashboardResponse } from '@/schemas/dashboard';
import type { CreateTransactionRequest, UpdateTransactionRequest } from '@/schemas/financial';
import type { CategoryResponse } from '@/schemas/legacyCategory';
import type { NestMember } from '@/schemas/nest';
import { DATA_MODE } from '@/services/api/config';
import { ENDPOINTS } from '@/services/api/endpoints';
import * as calendarService from '@/services/calendarService';
import * as dashboardService from '@/services/dashboardService';
import * as financialService from '@/services/financialService';
import * as categoryService from '@/services/legacyCategoryService';
import * as nestService from '@/services/nestService';
import * as noticeService from '@/services/noticeService';
import * as taskService from '@/services/taskService';
import * as weatherService from '@/services/weatherService';
import type { Task } from '@/types';
import { ApiPriority } from '@/types';

import { type BulletinNoteV2,DashboardBulletinBoardV2 } from './dashboard-v2/DashboardBulletinBoardV2';
import { DashboardDailyTasksV2 } from './dashboard-v2/DashboardDailyTasksV2';
import { DashboardHeaderV2 } from './dashboard-v2/DashboardHeaderV2';
import { DashboardHeroWidgetsV2 } from './dashboard-v2/DashboardHeroWidgetsV2';
import { DashboardPantryShoppingV2 } from './dashboard-v2/DashboardPantryShoppingV2';

function formatRelativeNoticeTime(dateValue?: string) {
  if (!dateValue) return undefined;
  const createdAt = new Date(dateValue);
  if (Number.isNaN(createdAt.getTime())) return undefined;

  const diffMs = Date.now() - createdAt.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return 'agora mesmo';
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `há ${minutes} min`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `há ${hours}h`;
  }
  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `há ${days}d`;
  }
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(createdAt);
}

const isMockMode = DATA_MODE === 'mock';

const cardSlide: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
};

/**
 * DashboardV2 — Visão Geral Redesenhada do Lar (Versão 2).
 * Traz layout Bento com KPIs em destaque, Quadro de Tarefas interativo,
 * Mural de Recados com reações, Timeline de compromissos e Acesso Rápido.
 */
export function DashboardV2() {
  const navigate = useNavigate();
  const { user, activeNestId } = useApp();
  const { showSuccess, showError } = useToastNotifications();

  const nestId = activeNestId ?? undefined;
  const currentUserId = user?.id ?? '';
  const currentNest = user?.nests?.find((n) => n.nestId === activeNestId);
  const currentUserRole = currentNest?.role ?? (isMockMode ? 1 : 3);
  const isOwnerOrAdmin = isMockMode || currentUserRole === 1 || currentUserRole === 2;

  // ── Estado do Dashboard Endpoint ──────────────────────────────────────────
  const [apiDashboard, setApiDashboard] = useState<DashboardResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(!isMockMode);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Estado de Tarefas, Recados, Eventos & Moradores ────────────────────────
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<NestMember[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const { presence: onlinePresences } = useNestPresence({
    nestId,
    intervalMs: 30000,
  });

  const displayMembers = useMemo(() => {
    return nestService.mergeMembersPresence(members, onlinePresences);
  }, [members, onlinePresences]);

  // ── Estado de Clima ───────────────────────────────────────────────────────
  const [weatherState, setWeatherState] = useState({
    loading: false,
    error: false,
    city: '',
    description: '',
    temperatureLabel: '--',
    conditionCode: null as string | null,
    temperature: null as number | null,
    visible: false,
  });
  const [weatherOnboardingKey, setWeatherOnboardingKey] = useState(0);

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{ id: string; message: string; priority: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [txSheetOpen, setTxSheetOpen] = useState(false);

  // ── SignalR Realtime Hub ──────────────────────────────────────────────────
  const hubUrl = !isMockMode && activeNestId ? ENDPOINTS.dashboardHub(activeNestId) : null;
  const { connectionRef, isConnected } = useSignalR(hubUrl);

  useDashboardRealtime({
    connectionRef,
    isConnected,
    setApiDashboard,
  });

  // ── Carregamento de Clima ──────────────────────────────────────────────────
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
    } catch {
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
    const onUpdated = () => loadWeather();
    window.addEventListener(WEATHER_PREFERENCES_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(WEATHER_PREFERENCES_UPDATED_EVENT, onUpdated);
  }, [loadWeather]);

  // ── Carregamento Principal de Dados ───────────────────────────────────────
  const refreshAllData = useCallback(async () => {
    if (!activeNestId && !isMockMode) {
      setIsLoadingData(false);
      return;
    }

    try {
      const [dashData, noticesData, eventsData, tasksData] = await Promise.all([
        dashboardService.getDashboard(nestId).catch(() => null),
        noticeService.getActiveNotices(nestId).catch(() => []),
        calendarService.getUpcomingEvents(5).catch(() => []),
        taskService.getActiveTasks(1, 10, nestId).catch(() => ({ items: [] })),
      ]);

      if (dashData) setApiDashboard(dashData);
      if (noticesData) setNotices(noticesData);
      if (eventsData) setCalendarEvents(eventsData);
      if (tasksData?.items) setTasksList(tasksData.items);
    } catch {
      // Silencioso se já estiver em fallback
    } finally {
      setIsLoadingData(false);
    }
  }, [nestId, activeNestId]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Moradores e categorias
  useEffect(() => {
    if (!nestId) return;
    let isMounted = true;

    Promise.all([
      nestService.getNestMembers(nestId).catch(() => []),
      categoryService.listCategories({ pageSize: 100 }, nestId).catch(() => []),
    ]).then(([membersRes, categoriesRes]) => {
      if (isMounted) {
        setMembers(membersRes ?? []);
        setCategories(categoriesRes ?? []);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [nestId]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshAllData(), loadWeather()]);
      toast.success('Dashboard atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar dashboard.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Derivação de Métricas ──────────────────────────────────────────────────

  const taskMetrics = useMemo(() => {
    const total = apiDashboard?.task?.totalDayTasks ?? tasksList.length;
    const finished = apiDashboard?.task?.totalDayFinishedTasks ?? tasksList.filter((t) => t.isCompleted).length;
    const rate = apiDashboard?.task?.rateTasks ?? (total > 0 ? Math.round((finished / total) * 100) : 0);
    return {
      totalDayTasks: total,
      totalDayFinishedTasks: finished,
      rateTasks: rate,
    };
  }, [apiDashboard, tasksList]);

  const shoppingMetrics = useMemo(() => {
    return {
      totalMonthItems: apiDashboard?.shoppingList?.totalMonthItems ?? 0,
      totalMonthEstimatedValue: apiDashboard?.shoppingList?.totalMonthEstimatedValue ?? 0,
    };
  }, [apiDashboard]);

  const eventsMetrics = useMemo(() => {
    const count = apiDashboard?.event?.totalWeekEvents ?? calendarEvents.length;
    const nextName = apiDashboard?.event?.nextEventName || (calendarEvents[0]?.title ?? '');
    const nextDate = apiDashboard?.event?.nextEventDate ?? (calendarEvents[0]?.startsAt ?? null);
    return {
      totalWeekEvents: count,
      nextEventDate: nextDate,
      nextEventName: nextName,
    };
  }, [apiDashboard, calendarEvents]);

  // ── Derivação de Recados ──────────────────────────────────────────────────
  const bulletinNotes: BulletinNoteV2[] = useMemo(() => {
    const rawList = notices && notices.length > 0 ? notices : (apiDashboard?.notices ?? []);
    const activeList = rawList.filter(
      (n) => n.isActive !== false && (n.isPinned || !noticeService.isCreatedInPastDays(n.createdAt || n.date))
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
      timeLabel: formatRelativeNoticeTime(n.createdAt || n.date),
      reactions: n.reactions ?? [],
    }));
  }, [notices, apiDashboard]);



  // ── Ações de Tarefas ───────────────────────────────────────────────────────
  const handleQuickAddTask = async (title: string) => {
    try {
      const created = await taskService.createQuickTask(title, nestId);
      setTasksList((prev) => [created, ...prev]);
      showSuccess('Tarefa adicionada!');
      refreshAllData();
    } catch {
      showError('Erro ao criar tarefa rápida.');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId, nestId);
      setTasksList((prev) =>
        prev.map((t) => (t.taskId === taskId ? { ...t, isCompleted: true } : t))
      );
      showSuccess('Tarefa concluída! 🎉');
      refreshAllData();
    } catch {
      showError('Erro ao concluir tarefa.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId, nestId);
      setTasksList((prev) => prev.filter((t) => t.taskId !== taskId));
      showSuccess('Tarefa excluída.');
      refreshAllData();
    } catch {
      showError('Erro ao excluir tarefa.');
    }
  };

  const handleTaskSubmit = async (payload: TaskFormPayload) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.taskId, payload, nestId);
        showSuccess('Tarefa atualizada!');
      } else {
        await taskService.createTask(payload, nestId);
        showSuccess('Tarefa criada!');
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      refreshAllData();
    } catch {
      showError('Erro ao salvar tarefa.');
    }
  };

  // ── Ações de Recados (Mural) ───────────────────────────────────────────────
  const handleSaveNotice = async (message: string, noteId?: string, priority?: number) => {
    try {
      if (noteId) {
        await noticeService.updateNotice(noteId, { message, priority }, nestId);
      } else {
        await noticeService.createNotice(
          { message, priority: priority ?? ApiPriority.Baixa, date: new Date().toISOString() },
          nestId,
          user
            ? {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              }
            : undefined
        );
      }
      const data = await noticeService.getActiveNotices(nestId);
      setNotices(data);
      showSuccess('Recado salvo com sucesso!');
    } catch {
      showError('Erro ao salvar recado.');
    }
  };

  const handleDeleteNotice = async (noteId: string) => {
    try {
      await noticeService.deleteNotice(noteId, nestId);
      const data = await noticeService.getActiveNotices(nestId);
      setNotices(data);
      showSuccess('Recado excluído.');
    } catch {
      showError('Erro ao excluir recado.');
    }
  };

  const handleTogglePinNotice = async (noteId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await noticeService.unpinNotice(noteId, nestId);
      } else {
        await noticeService.pinNotice(noteId, nestId);
      }
      const data = await noticeService.getActiveNotices(nestId);
      setNotices(data);
    } catch {
      // Silencioso em caso de erro na ação de fixar
    }
  };

  const handleReactNotice = async (noteId: string, emoji: string) => {
    try {
      await noticeService.reactToNotice(
        noteId,
        emoji,
        nestId,
        user
          ? {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
            }
          : undefined
      );
      const data = await noticeService.getActiveNotices(nestId);
      setNotices(data);
    } catch {
      // Silencioso em caso de erro na reação
    }
  };

  // ── Ações de Transação Financeira ─────────────────────────────────────────
  const handleCreateTransaction = async (payload: CreateTransactionRequest) => {
    try {
      await financialService.createTransaction(payload, nestId);
      showSuccess('Transação registrada com sucesso!');
      setTxSheetOpen(false);
      refreshAllData();
    } catch {
      showError('Erro ao criar transação.');
    }
  };

  const handleCreateCategory = async (payload: { name: string; type: number }) => {
    const created = await categoryService.createCategory(payload, nestId);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-x-hidden pb-12">
      {/* ── Banner de Alternância de Versão (V2 Beta) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Sparkles size={16} />
          <span>
            Você está visualizando a <strong className="font-bold">Versão 2 Redesenhada</strong> do
            Dashboard do Ninho
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="font-ui font-semibold text-primary underline transition-colors hover:text-primary/80"
          >
            Voltar para V1
          </button>
        </div>
      </div>

      {/* ── Row 1: Header do Dashboard V2 ── */}
      <div data-tour="dashboard-header">
        <DashboardHeaderV2
          userName={user?.callmeby || user?.name || 'Família'}
          currentUserId={user?.id}
          activeNest={currentNest}
          members={displayMembers}
          pendingTasksCount={taskMetrics.totalDayTasks - taskMetrics.totalDayFinishedTasks}
          showWeather={weatherState.visible}
          weatherCity={weatherState.city || 'São Paulo'}
          weatherDescription={weatherState.description || 'Tempo indisponível'}
          weatherTemperatureLabel={weatherState.temperatureLabel}
          weatherConditionCode={weatherState.conditionCode}
          weatherTemperature={weatherState.temperature}
          isWeatherLoading={weatherState.loading}
          isWeatherError={weatherState.error}
          isRealtimeConnected={isConnected}
          onRefreshWeather={loadWeather}
          onWeatherEnable={handleEnableWeather}
          weatherOnboardingKey={weatherOnboardingKey}
          onRefreshDashboard={handleManualRefresh}
          isRefreshingDashboard={isRefreshing}
        />
      </div>

      {/* ── Row 2: 3 Living Widgets (Tarefas, Despensa, Agenda) com Ícones 3D ── */}
      <div data-tour="dashboard-metrics">
        <DashboardHeroWidgetsV2
          tasks={taskMetrics}
          shopping={shoppingMetrics}
          events={eventsMetrics}
          isLoading={isLoadingData}
          onTasksClick={() => {
            const el = document.getElementById('dashboard-tasks-block');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/tasks');
          }}
          onShoppingClick={() => {
            const el = document.getElementById('dashboard-pantry-block');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/shopping');
          }}
          onCalendarClick={() => navigate('/calendar')}
        />
      </div>

      {/* ── Row 3: Grid Central Mobile-First (Tarefas, Compras, Mural de Recados) ── */}
      <motion.div
        className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
      >
        {/* Bloco 1: Quadro de Tarefas (Caderno Espiral) */}
        <motion.div
          id="dashboard-tasks-block"
          variants={cardSlide}
          data-tour="dashboard-tasks"
          className="flex flex-col h-full"
        >
          <DashboardDailyTasksV2
            tasks={tasksList}
            members={displayMembers}
            onAddTask={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            onQuickAddTask={handleQuickAddTask}
            onCompleteTask={handleCompleteTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        </motion.div>

        {/* Bloco 2: Lista de Compras / Despensa do Lar */}
        <motion.div
          id="dashboard-pantry-block"
          variants={cardSlide}
          data-tour="dashboard-pantry"
          className="flex flex-col h-full"
        >
          <DashboardPantryShoppingV2
            nestId={nestId}
            onOpenFullList={() => navigate('/shopping')}
          />
        </motion.div>

        {/* Bloco 3: Mural de Recados (Post-its com Washi Tape) */}
        <motion.div
          id="dashboard-bulletin-block"
          variants={cardSlide}
          data-tour="dashboard-bulletin"
          className="flex flex-col h-full"
        >
          <DashboardBulletinBoardV2
            notes={bulletinNotes}
            currentUserId={currentUserId}
            isOwnerOrAdmin={isOwnerOrAdmin}
            onCreateNote={() => {
              setEditingNote(null);
              setCreateNoteOpen(true);
            }}
            onEditNote={(note) => {
              setEditingNote({
                id: note.id,
                message: String(note.content),
                priority: note.priority,
              });
              setCreateNoteOpen(true);
            }}
            onDeleteNote={handleDeleteNotice}
            onTogglePin={handleTogglePinNotice}
            onReactNote={handleReactNotice}
            onViewHistory={() => setHistoryOpen(true)}
          />
        </motion.div>
      </motion.div>

      {/* ── Modais Integrados ── */}
      <CreateNoteModal
        open={createNoteOpen}
        onClose={() => {
          setCreateNoteOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNotice}
        initialData={editingNote}
      />

      <NoticeHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        nestId={nestId}
      />

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        members={displayMembers}
        onSubmit={handleTaskSubmit}
      />

      <TransactionSheet
        open={txSheetOpen}
        onClose={() => setTxSheetOpen(false)}
        categories={categories}
        nestId={nestId}
        currentUserId={currentUserId}
        onCreate={handleCreateTransaction}
        onCreateCategory={handleCreateCategory}
        editingTransaction={null}
        onUpdate={async (payload: UpdateTransactionRequest) => {
          await financialService.updateTransaction(payload, nestId);
          showSuccess('Transação atualizada!');
          setTxSheetOpen(false);
          refreshAllData();
        }}
      />
    </div>
  );
}

export default DashboardV2;

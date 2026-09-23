import type * as signalR from '@microsoft/signalr';
import type React from 'react';
import { useEffect } from 'react';

import type {
  DashboardFinancialSummary,
  DashboardResponse,
  DashboardShoppingListSummary,
  DashboardTasksSummary,
} from '@/schemas/dashboard';

interface UseDashboardRealtimeArgs {
  connectionRef: React.MutableRefObject<signalR.HubConnection | null>;
  isConnected: boolean;
  setApiDashboard: React.Dispatch<React.SetStateAction<DashboardResponse | null>>;
}

export function useDashboardRealtime({
  connectionRef,
  isConnected,
  setApiDashboard,
}: UseDashboardRealtimeArgs): void {
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected) return;

    const onFinancialUpdated = (raw: Record<string, unknown>) => {
      const summary: DashboardFinancialSummary = {
        totalMonthSpent: Number(raw?.totalMonthSpent ?? raw?.TotalMonthSpent ?? 0),
        totalLastMonthSpent: Number(raw?.totalLastMonthSpent ?? raw?.TotalLastMonthSpent ?? 0),
        monthVariation: Number(raw?.monthVariation ?? raw?.MonthVariation ?? 0),
      };

      setApiDashboard((prev) =>
        prev
          ? { ...prev, financial: summary }
          : {
              financial: summary,
              shoppingList: { totalMonthItems: 0, totalMonthEstimatedValue: 0 },
              task: { totalDayTasks: 0, totalDayFinishedTasks: 0, rateTasks: 0 },
              event: { totalWeekEvents: 0, nextEventDate: null, nextEventName: '' },
              notices: [],
              events: [],
            }
      );
    };

    const onShoppingUpdated = (raw: Record<string, unknown>) => {
      const summary: DashboardShoppingListSummary = {
        totalMonthItems: Number(raw?.totalMonthItems ?? raw?.TotalMonthItems ?? 0),
        totalMonthEstimatedValue: Number(
          raw?.totalMonthEstimatedValue ?? raw?.TotalMonthEstimatedValue ?? 0
        ),
      };

      setApiDashboard((prev) =>
        prev
          ? { ...prev, shoppingList: summary }
          : {
              financial: { totalMonthSpent: 0, totalLastMonthSpent: 0, monthVariation: 0 },
              shoppingList: summary,
              task: { totalDayTasks: 0, totalDayFinishedTasks: 0, rateTasks: 0 },
              event: { totalWeekEvents: 0, nextEventDate: null, nextEventName: '' },
              notices: [],
              events: [],
            }
      );
    };

    const onTasksUpdated = (raw: Record<string, unknown>) => {
      const summary: DashboardTasksSummary = {
        totalDayTasks: Number(raw?.totalDayTasks ?? raw?.TotalDayTasks ?? 0),
        totalDayFinishedTasks: Number(
          raw?.totalDayFinishedTasks ?? raw?.TotalDayFinishedTasks ?? 0
        ),
        rateTasks: Number(raw?.rateTasks ?? raw?.RateTasks ?? 0),
      };

      setApiDashboard((prev) =>
        prev
          ? { ...prev, task: summary }
          : {
              financial: { totalMonthSpent: 0, totalLastMonthSpent: 0, monthVariation: 0 },
              shoppingList: { totalMonthItems: 0, totalMonthEstimatedValue: 0 },
              task: summary,
              event: { totalWeekEvents: 0, nextEventDate: null, nextEventName: '' },
              notices: [],
              events: [],
            }
      );
    };

    connection.on('ReceiveFinancialSummaryUpdated', onFinancialUpdated);
    connection.on('ReceiveShoppingSummaryUpdated', onShoppingUpdated);
    connection.on('ReceiveTasksSummaryUpdated', onTasksUpdated);

    return () => {
      connection.off('ReceiveFinancialSummaryUpdated', onFinancialUpdated);
      connection.off('ReceiveShoppingSummaryUpdated', onShoppingUpdated);
      connection.off('ReceiveTasksSummaryUpdated', onTasksUpdated);
    };
  }, [connectionRef, isConnected, setApiDashboard]);
}

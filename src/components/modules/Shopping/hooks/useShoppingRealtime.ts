import type * as signalR from '@microsoft/signalr';
import type React from 'react';
import { useEffect } from 'react';

import { getShoppingListById, mapItem } from '@/services/shoppingService';
import type { AppShoppingList, AppShoppingListSummary } from '@/types';

import type { ViewMode } from '../types';

interface UseShoppingRealtimeArgs {
  connectionRef: React.MutableRefObject<signalR.HubConnection | null>;
  isConnected: boolean;
  viewMode: ViewMode;
  selectedListId: string | null;
  setDetailData: React.Dispatch<React.SetStateAction<AppShoppingList | null>>;
  setShoppingLists: React.Dispatch<React.SetStateAction<AppShoppingListSummary[]>>;
  backToLists: () => void;
  nestId: string | undefined;
}

export function useShoppingRealtime({
  connectionRef,
  isConnected,
  viewMode,
  selectedListId,
  setDetailData,
  setShoppingLists,
  backToLists,
  nestId,
}: UseShoppingRealtimeArgs): void {
  // Join/leave list group when navigating into/out of detail view
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected) return;
    if (viewMode === 'detail' && selectedListId) {
      connection.invoke('JoinList', selectedListId).catch((err) => {
        if (import.meta.env.DEV) console.warn('[useShoppingRealtime] JoinList failed:', err);
      });
      return () => {
        connectionRef.current?.invoke('LeaveList', selectedListId).catch(() => {});
      };
    }
  }, [isConnected, viewMode, selectedListId]);

  // Nest-level events (always active while connected)
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected) return;

    const onListDeleted = (payload: { listId: string }) => {
      setShoppingLists((prev) => prev.filter((l) => l.shoppingListId !== payload.listId));
      if (selectedListId === payload.listId) {
        backToLists();
      }
    };

    const onListUpdated = async (payload: { listId: string }) => {
      try {
        const updated = await getShoppingListById(payload.listId, nestId);
        setDetailData((prev) => (prev?.shoppingListId === payload.listId ? updated : prev));
        setShoppingLists((prev) =>
          prev.map((l) =>
            l.shoppingListId === payload.listId
              ? { ...l, name: updated.name, notes: updated.notes }
              : l,
          ),
        );
      } catch {
        // list may have been deleted — ignore
      }
    };

    const onListStatusChanged = (payload: { listId: string; isFinished: boolean }) => {
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === payload.listId ? { ...l, isFinished: payload.isFinished } : l,
        ),
      );
    };

    connection.on('ReceiveListDeleted', onListDeleted);
    connection.on('ReceiveListUpdated', onListUpdated);
    connection.on('ReceiveListStatusChanged', onListStatusChanged);

    return () => {
      connection.off('ReceiveListDeleted', onListDeleted);
      connection.off('ReceiveListUpdated', onListUpdated);
      connection.off('ReceiveListStatusChanged', onListStatusChanged);
    };
  }, [isConnected, selectedListId, nestId, backToLists, setDetailData, setShoppingLists]);

  // List-level events (item mutations)
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected) return;

    const onItemCreated = (raw: unknown) => {
      const item = mapItem(raw as Parameters<typeof mapItem>[0]);
      setDetailData((prev) => {
        if (!prev) return prev;
        return { ...prev, items: [...prev.items, item] };
      });
    };

    const onItemUpdated = (raw: unknown) => {
      const item = mapItem(raw as Parameters<typeof mapItem>[0]);
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === item.shoppingItemId ? item : i,
          ),
        };
      });
    };

    const onItemDeleted = (payload: { itemId: string }) => {
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((i) => i.shoppingItemId !== payload.itemId),
        };
      });
    };

    const onItemPurchaseChanged = (payload: {
      itemId: string;
      isPurchased: boolean;
      price: number | null;
    }) => {
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === payload.itemId
              ? { ...i, isPurchased: payload.isPurchased, price: payload.price }
              : i,
          ),
        };
      });
    };

    connection.on('ReceiveItemCreated', onItemCreated);
    connection.on('ReceiveItemUpdated', onItemUpdated);
    connection.on('ReceiveItemDeleted', onItemDeleted);
    connection.on('ReceiveItemPurchaseChanged', onItemPurchaseChanged);

    return () => {
      connection.off('ReceiveItemCreated', onItemCreated);
      connection.off('ReceiveItemUpdated', onItemUpdated);
      connection.off('ReceiveItemDeleted', onItemDeleted);
      connection.off('ReceiveItemPurchaseChanged', onItemPurchaseChanged);
    };
  }, [isConnected, setDetailData]);
}

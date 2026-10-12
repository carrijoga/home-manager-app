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
        connection.invoke('LeaveList', selectedListId).catch(() => {});
      };
    }
  }, [connectionRef, isConnected, viewMode, selectedListId]);

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
              : l
          )
        );
      } catch {
        // list may have been deleted — ignore
      }
    };

    const onListStatusChanged = (payload: { listId: string; isFinished: boolean }) => {
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.shoppingListId === payload.listId ? { ...l, isFinished: payload.isFinished } : l
        )
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
  }, [
    connectionRef,
    isConnected,
    selectedListId,
    nestId,
    backToLists,
    setDetailData,
    setShoppingLists,
  ]);

  // List-level events (item mutations)
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || !isConnected) return;

    const onItemCreated = (raw: unknown) => {
      const item = mapItem(raw as Parameters<typeof mapItem>[0]);
      setDetailData((prev) => {
        if (!prev) return prev;
        const idx = prev.items.findIndex((i) => i.shoppingItemId === item.shoppingItemId);
        if (idx === -1) return { ...prev, items: [item, ...prev.items] };
        const items = [...prev.items];
        items[idx] = item;
        return { ...prev, items };
      });
    };

    const onItemUpdated = (raw: unknown) => {
      const item = mapItem(raw as Parameters<typeof mapItem>[0]);
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) => (i.shoppingItemId === item.shoppingItemId ? item : i)),
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

    const onItemPurchaseChanged = async (payload: {
      itemId: string;
      isPurchased: boolean;
      price: number | null;
    }) => {
      // Estado imediato (o evento não traz a quantidade comprada)
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === payload.itemId
              ? {
                  ...i,
                  isPurchased: payload.isPurchased,
                  status: payload.isPurchased ? 1 : i.status === 1 ? 0 : i.status,
                  price: payload.price,
                  ...(payload.isPurchased ? {} : { purchasedQuantity: null, purchasedAt: null }),
                }
              : i
          ),
        };
      });
      // Recarrega para obter purchasedQuantity/purchasedAt reais do item
      if (!selectedListId) return;
      try {
        const fresh = await getShoppingListById(selectedListId, nestId);
        const freshItem = fresh.items.find((i) => i.shoppingItemId === payload.itemId);
        if (!freshItem) return;
        setDetailData((prev) =>
          prev && prev.shoppingListId === fresh.shoppingListId
            ? {
                ...prev,
                items: prev.items.map((i) => (i.shoppingItemId === payload.itemId ? freshItem : i)),
              }
            : prev
        );
      } catch {
        // lista pode ter sido excluída — ignora
      }
    };

    const onItemStatusChanged = (payload: {
      itemId: string;
      status: number;
    }) => {
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === payload.itemId
              ? {
                  ...i,
                  status: payload.status,
                  isPurchased: payload.status === 1,
                  ...(payload.status !== 1
                    ? { price: null, purchasedAt: null, purchasedQuantity: null }
                    : {}),
                }
              : i
          ),
        };
      });
    };

    connection.on('ReceiveItemCreated', onItemCreated);
    connection.on('ReceiveItemUpdated', onItemUpdated);
    connection.on('ReceiveItemDeleted', onItemDeleted);
    connection.on('ReceiveItemPurchaseChanged', onItemPurchaseChanged);
    connection.on('ReceiveItemStatusChanged', onItemStatusChanged);

    return () => {
      connection.off('ReceiveItemCreated', onItemCreated);
      connection.off('ReceiveItemUpdated', onItemUpdated);
      connection.off('ReceiveItemDeleted', onItemDeleted);
      connection.off('ReceiveItemPurchaseChanged', onItemPurchaseChanged);
      connection.off('ReceiveItemStatusChanged', onItemStatusChanged);
    };
  }, [connectionRef, isConnected, setDetailData, selectedListId, nestId]);
}

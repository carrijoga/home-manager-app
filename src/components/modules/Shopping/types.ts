export type ViewMode = 'lists' | 'detail';

export interface ListFormData {
  name: string;
  monthYear: string; // YYYY-MM
  notes: string;
}

export interface ItemFormData {
  name: string;
  quantity: string;
  unitType: string;
  categoryId: string;
  estimatedPrice: number | null;
  notes: string;
}

export interface PurchaseFormData {
  quantity: string;
  price: number | null;
  purchasedAt: string; // YYYY-MM-DD
}

export interface BulkEditPatch {
  quantity?: number;
  unitType?: number;
  categoryId?: string | null;
  estimatedPrice?: number;
}

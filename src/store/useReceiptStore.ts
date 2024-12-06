import { create } from 'zustand';
import { Receipt } from '../types/receipt';
import { db } from '../db/indexedDB';

interface ReceiptStore {
  receipts: Receipt[];
  isLoading: boolean;
  setReceipts: (receipts: Receipt[]) => void;
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (id: string, receipt: Receipt) => void;
  deleteReceipt: (id: string) => void;
  loadReceipts: () => Promise<void>;
}

export const useReceiptStore = create<ReceiptStore>((set, get) => ({
  receipts: [],
  isLoading: true,

  setReceipts: async (receipts) => {
    await db.saveReceipts(receipts);
    set({ receipts });
  },

  addReceipt: async (receipt) => {
    const { receipts } = get();
    const updatedReceipts = [...receipts, receipt];
    await db.saveReceipts(updatedReceipts);
    set({ receipts: updatedReceipts });
  },

  updateReceipt: async (id, updatedReceipt) => {
    const { receipts } = get();
    const updatedReceipts = receipts.map((receipt) =>
      receipt.id === id ? updatedReceipt : receipt
    );
    await db.saveReceipts(updatedReceipts);
    set({ receipts: updatedReceipts });
  },

  deleteReceipt: async (id) => {
    const { receipts } = get();
    const updatedReceipts = receipts.filter((receipt) => receipt.id !== id);
    await db.saveReceipts(updatedReceipts);
    set({ receipts: updatedReceipts });
  },

  loadReceipts: async () => {
    try {
      const receipts = await db.loadReceipts();
      set({ receipts, isLoading: false });
    } catch (error) {
      console.error('Failed to load receipts:', error);
      set({ isLoading: false });
    }
  },
}));
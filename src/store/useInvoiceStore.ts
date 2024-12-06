import { create } from 'zustand';
import { Invoice } from '../types/invoice';
import { db } from '../db/indexedDB';

interface InvoiceStore {
  invoices: Invoice[];
  isLoading: boolean;
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  loadInvoices: () => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  isLoading: true,

  setInvoices: async (invoices) => {
    // Handle duplicate invoice numbers during bulk import
    const uniqueInvoices = invoices.reduce((acc, current) => {
      const existing = acc[current.numberInvoice];
      if (existing) {
        // Merge the invoices, keeping existing values when new ones are empty
        acc[current.numberInvoice] = {
          ...existing,
          ...Object.fromEntries(
            Object.entries(current).filter(([_, value]) => 
              value !== undefined && 
              value !== '' && 
              value !== null
            )
          ),
        };
      } else {
        acc[current.numberInvoice] = current;
      }
      return acc;
    }, {} as Record<string, Invoice>);
    
    const finalInvoices = Object.values(uniqueInvoices);
    await db.saveInvoices(finalInvoices);
    set({ invoices: finalInvoices });
  },

  addInvoice: async (invoice) => {
    const { invoices } = get();
    const existingInvoice = invoices.find(
      (inv) => inv.numberInvoice === invoice.numberInvoice
    );

    let updatedInvoices: Invoice[];
    if (existingInvoice) {
      // Merge the invoices, keeping existing values when new ones are empty
      const mergedInvoice = {
        ...existingInvoice,
        ...Object.fromEntries(
          Object.entries(invoice).filter(([_, value]) => 
            value !== undefined && 
            value !== '' && 
            value !== null
          )
        ),
        id: existingInvoice.id, // Keep the existing ID
      };

      updatedInvoices = invoices.map((inv) =>
        inv.id === existingInvoice.id ? mergedInvoice : inv
      );
    } else {
      updatedInvoices = [...invoices, invoice];
    }

    await db.saveInvoices(updatedInvoices);
    set({ invoices: updatedInvoices });
  },

  updateInvoice: async (id, updatedInvoice) => {
    const { invoices } = get();
    const existingInvoice = invoices.find(
      (inv) => inv.numberInvoice === updatedInvoice.numberInvoice && inv.id !== id
    );

    let updatedInvoices: Invoice[];
    if (existingInvoice) {
      // Merge with existing invoice that has the same number
      const mergedInvoice = {
        ...existingInvoice,
        ...Object.fromEntries(
          Object.entries(updatedInvoice).filter(([_, value]) => 
            value !== undefined && 
            value !== '' && 
            value !== null
          )
        ),
        id: existingInvoice.id, // Keep the existing ID
      };

      // Remove the old invoice and add the merged one
      updatedInvoices = invoices
        .filter((inv) => inv.id !== id && inv.id !== existingInvoice.id)
        .concat(mergedInvoice);
    } else {
      updatedInvoices = invoices.map((invoice) =>
        invoice.id === id ? updatedInvoice : invoice
      );
    }

    await db.saveInvoices(updatedInvoices);
    set({ invoices: updatedInvoices });
  },

  deleteInvoice: async (id) => {
    const { invoices } = get();
    const updatedInvoices = invoices.filter((invoice) => invoice.id !== id);
    await db.saveInvoices(updatedInvoices);
    set({ invoices: updatedInvoices });
  },

  loadInvoices: async () => {
    try {
      const invoices = await db.loadInvoices();
      set({ invoices, isLoading: false });
    } catch (error) {
      console.error('Failed to load invoices:', error);
      set({ isLoading: false });
    }
  },
}));
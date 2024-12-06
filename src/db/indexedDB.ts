import { Invoice } from '../types/invoice';
import { Settings } from '../types/settings';
import { Receipt } from '../types/receipt';
import { Conversation } from '../types/conversation';
import toast from 'react-hot-toast';

const DB_NAME = 'crm_invoice_db';
const DB_VERSION = 5;

class IndexedDB {
  private db: IDBDatabase | null = null;

  async connect(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('invoices')) {
          db.createObjectStore('invoices', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('receipts')) {
          const receiptStore = db.createObjectStore('receipts', { keyPath: 'id' });
          receiptStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
          conversationStore.createIndex('receiptId', 'receiptId', { unique: true });
        }
      };
    });
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('conversations', 'readwrite');
        const store = transaction.objectStore('conversations');

        // Clear existing data
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          // Add all conversations
          conversations.forEach(conversation => {
            store.put(conversation);
          });
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error saving conversations:', error);
      throw error;
    }
  }

  async loadConversations(): Promise<Conversation[]> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('conversations', 'readonly');
        const store = transaction.objectStore('conversations');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
      throw error;
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('settings', 'readwrite');
        const store = transaction.objectStore('settings');
        
        const settingsWithId = { id: 'main', ...settings };
        store.put(settingsWithId);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async loadSettings(): Promise<Settings | null> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('settings', 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('main');

        request.onsuccess = () => {
          if (request.result) {
            const { id, ...settings } = request.result;
            resolve(settings);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  }

  async saveInvoices(invoices: Invoice[]): Promise<void> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('invoices', 'readwrite');
        const store = transaction.objectStore('invoices');

        // Clear existing data
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          // Add all invoices
          invoices.forEach(invoice => {
            store.put(invoice);
          });
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error saving invoices:', error);
      throw error;
    }
  }

  async loadInvoices(): Promise<Invoice[]> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('invoices', 'readonly');
        const store = transaction.objectStore('invoices');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading invoices:', error);
      throw error;
    }
  }

  async saveReceipts(receipts: Receipt[]): Promise<void> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('receipts', 'readwrite');
        const store = transaction.objectStore('receipts');

        // Clear existing data
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          // Add all receipts
          receipts.forEach(receipt => {
            store.put(receipt);
          });
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Error saving receipts:', error);
      throw error;
    }
  }

  async loadReceipts(): Promise<Receipt[]> {
    try {
      await this.connect();
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction('receipts', 'readonly');
        const store = transaction.objectStore('receipts');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading receipts:', error);
      throw error;
    }
  }
}

export const db = new IndexedDB();
import { create } from 'zustand';
import { Settings, SettingsOption, KPITarget } from '../types/settings';
import { db } from '../db/indexedDB';

interface SettingsStore {
  settings: Settings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  addOption: (category: keyof Settings, value: string, options?: Partial<SettingsOption>) => void;
  updateOption: (category: keyof Settings, id: string, options: Partial<SettingsOption>) => void;
  toggleOption: (category: keyof Settings, id: string) => void;
  deleteOption: (category: keyof Settings, id: string) => void;
  updateKPITarget: (target: KPITarget) => Promise<void>;
}

const defaultSettings: Settings = {
  statuses: [
    { id: '1', value: 'Pending', isActive: true },
    { id: '2', value: 'Paid', isActive: true },
    { id: '3', value: 'Overdue', isActive: true },
    { id: '4', value: 'Cancelled', isActive: true },
  ],
  branches: [],
  salespeople: [],
  debtCollectors: [],
  banks: [
    { id: '1', value: 'Maybank', isActive: true },
    { id: '2', value: 'CIMB Bank', isActive: true },
    { id: '3', value: 'Public Bank', isActive: true },
    { id: '4', value: 'RHB Bank', isActive: true },
    { id: '5', value: 'Hong Leong Bank', isActive: true },
    { id: '6', value: 'AmBank', isActive: true },
    { id: '7', value: 'Bank Islam', isActive: true },
    { id: '8', value: 'Bank Rakyat', isActive: true },
  ],
  receiptStatuses: [
    { id: '1', value: 'New', isActive: true },
    { id: '2', value: 'On Hold', isActive: true },
    { id: '3', value: 'Cancelled', isActive: true },
    { id: '4', value: 'Reconciled', isActive: true },
  ],
  kpiTargets: [],
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  loadSettings: async () => {
    try {
      const savedSettings = await db.loadSettings();
      set({ 
        settings: savedSettings ? {
          ...defaultSettings,
          ...savedSettings,
          kpiTargets: savedSettings.kpiTargets || [],
        } : defaultSettings,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ 
        settings: defaultSettings,
        isLoading: false 
      });
    }
  },

  updateKPITarget: async (target: KPITarget) => {
    try {
      const { settings } = get();
      const updatedTargets = settings.kpiTargets.filter(t => {
        if (target.type === 'company' || target.type === 'company-sales') {
          return t.type !== target.type;
        }
        if (target.type === 'individual') {
          return t.debtCollectorName !== target.debtCollectorName;
        }
        if (target.type === 'salesperson') {
          return t.salespersonName !== target.salespersonName;
        }
        return true;
      });
      updatedTargets.push(target);

      const updatedSettings = {
        ...settings,
        kpiTargets: updatedTargets,
      };

      await db.saveSettings(updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update KPI target:', error);
      throw error;
    }
  },

  addOption: async (category, value, options = {}) => {
    const { settings } = get();
    const newOption: SettingsOption = {
      id: crypto.randomUUID(),
      value,
      isActive: true,
      ...options,
    };
    
    const updatedSettings = {
      ...settings,
      [category]: [...(settings[category] || []), newOption],
    };
    
    await db.saveSettings(updatedSettings);
    set({ settings: updatedSettings });
  },

  updateOption: async (category, id, options) => {
    const { settings } = get();
    const updatedSettings = {
      ...settings,
      [category]: settings[category].map((option) =>
        option.id === id ? { ...option, ...options } : option
      ),
    };
    await db.saveSettings(updatedSettings);
    set({ settings: updatedSettings });
  },

  toggleOption: async (category, id) => {
    const { settings } = get();
    const updatedSettings = {
      ...settings,
      [category]: settings[category].map((option) =>
        option.id === id ? { ...option, isActive: !option.isActive } : option
      ),
    };
    await db.saveSettings(updatedSettings);
    set({ settings: updatedSettings });
  },

  deleteOption: async (category, id) => {
    const { settings } = get();
    const updatedSettings = {
      ...settings,
      [category]: settings[category].filter((option) => option.id !== id),
    };
    await db.saveSettings(updatedSettings);
    set({ settings: updatedSettings });
  },
}));
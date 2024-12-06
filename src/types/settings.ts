export interface KPITarget {
  id: string;
  type: 'company' | 'individual' | 'company-sales' | 'salesperson';
  debtCollectorName?: string;
  salespersonName?: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  boxDailyTarget?: number;
  boxWeeklyTarget?: number;
  boxMonthlyTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsOption {
  id: string;
  value: string;
  isActive: boolean;
  branch?: string;
  imageUrl?: string;
}

export interface Settings {
  statuses: SettingsOption[];
  branches: SettingsOption[];
  salespeople: SettingsOption[];
  debtCollectors: SettingsOption[];
  banks: SettingsOption[];
  receiptStatuses: SettingsOption[];
  kpiTargets: KPITarget[];
}
import React from 'react';
import { Settings } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { CsvTemplateDownload } from './CsvTemplateDownload';
import { useSettingsStore } from '../../store/useSettingsStore';

export const SettingsPage: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CsvTemplateDownload />
          
          <SettingsSection
            title="Invoice Status"
            category="statuses"
            items={settings.statuses}
          />
          <SettingsSection
            title="Branches"
            category="branches"
            items={settings.branches}
          />
          <SettingsSection
            title="Salespeople"
            category="salespeople"
            items={settings.salespeople}
          />
          <SettingsSection
            title="Debt Collectors"
            category="debtCollectors"
            items={settings.debtCollectors}
          />
          <SettingsSection
            title="Banks"
            category="banks"
            items={settings.banks}
          />
          <SettingsSection
            title="Receipt Statuses"
            category="receiptStatuses"
            items={settings.receiptStatuses}
          />
        </div>
      </div>
    </div>
  );
};
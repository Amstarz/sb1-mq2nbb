import React from 'react';
import { Modal } from '../Modal';
import { useSettingsStore } from '../../store/useSettingsStore';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface KPIFiltersProps {
  filters: {
    branches: string[];
    dateRange: string;
    dateFrom: string;
    dateTo: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    branches: string[];
    dateRange: string;
    dateFrom: string;
    dateTo: string;
  }>>;
  isOpen: boolean;
  onClose: () => void;
}

export const KPIFilters: React.FC<KPIFiltersProps> = ({
  filters,
  setFilters,
  isOpen,
  onClose,
}) => {
  const { settings } = useSettingsStore();

  const handleBranchToggle = (branchName: string) => {
    setFilters(prev => ({
      ...prev,
      branches: prev.branches.includes(branchName)
        ? prev.branches.filter(name => name !== branchName)
        : [...prev.branches, branchName]
    }));
  };

  const handleDateRangeSelect = (range: string) => {
    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date;

    switch (range) {
      case 'daily':
        dateFrom = startOfDay(now);
        dateTo = endOfDay(now);
        break;
      case 'weekly':
        dateFrom = startOfWeek(now, { weekStartsOn: 1 });
        dateTo = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'monthly':
        dateFrom = startOfMonth(now);
        dateTo = endOfMonth(now);
        break;
      case 'yearly':
        dateFrom = startOfYear(now);
        dateTo = endOfYear(now);
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      dateRange: range,
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="KPI Filters">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branches
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {settings.branches
              .filter((branch) => branch.isActive)
              .map((branch) => (
                <label key={branch.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.branches.includes(branch.value)}
                    onChange={() => handleBranchToggle(branch.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{branch.value}</span>
                </label>
              ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDateRangeSelect('daily')}
              className={`px-4 py-2 text-sm border rounded-md ${
                filters.dateRange === 'daily'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => handleDateRangeSelect('weekly')}
              className={`px-4 py-2 text-sm border rounded-md ${
                filters.dateRange === 'weekly'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleDateRangeSelect('monthly')}
              className={`px-4 py-2 text-sm border rounded-md ${
                filters.dateRange === 'monthly'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleDateRangeSelect('yearly')}
              className={`px-4 py-2 text-sm border rounded-md ${
                filters.dateRange === 'yearly'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Custom Date Range</label>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <div>
              <label className="block text-xs text-gray-500">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ 
                  ...prev, 
                  dateRange: 'custom',
                  dateFrom: e.target.value 
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ 
                  ...prev,
                  dateRange: 'custom',
                  dateTo: e.target.value 
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              setFilters({
                branches: [],
                dateRange: 'all',
                dateFrom: '',
                dateTo: '',
              });
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
};
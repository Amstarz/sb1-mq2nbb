```typescript
import React from 'react';
import { Modal } from '../Modal';
import { useSettingsStore } from '../../store/useSettingsStore';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
    bank: string;
    debtCollectors: string[];
    dateFrom: string;
    dateTo: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string;
    bank: string;
    debtCollectors: string[];
    dateFrom: string;
    dateTo: string;
  }>>;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
}) => {
  const { settings } = useSettingsStore();

  const handleDebtCollectorToggle = (collectorName: string) => {
    setFilters(prev => ({
      ...prev,
      debtCollectors: prev.debtCollectors.includes(collectorName)
        ? prev.debtCollectors.filter(name => name !== collectorName)
        : [...prev.debtCollectors, collectorName]
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
        dateFrom = startOfWeek(now, { weekStartsOn: 1 }); // Start from Monday
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
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Receipts">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {settings.receiptStatuses
              .filter((status) => status.isActive)
              .map((status) => (
                <option key={`filter-status-${status.id}`} value={status.value}>
                  {status.value}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank</label>
          <select
            value={filters.bank}
            onChange={(e) => setFilters((prev) => ({ ...prev, bank: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Banks</option>
            {settings.banks
              .filter((bank) => bank.isActive)
              .map((bank) => (
                <option key={`filter-bank-${bank.id}`} value={bank.value}>
                  {bank.value}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Debt Collectors
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {settings.debtCollectors
              .filter((collector) => collector.isActive)
              .map((collector) => (
                <label key={collector.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.debtCollectors.includes(collector.value)}
                    onChange={() => handleDebtCollectorToggle(collector.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{collector.value}</span>
                </label>
              ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDateRangeSelect('daily')}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => handleDateRangeSelect('weekly')}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              This Week
            </button>
            <button
              onClick={() => handleDateRangeSelect('monthly')}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              This Month
            </button>
            <button
              onClick={() => handleDateRangeSelect('yearly')}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              This Year
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
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              setFilters({
                status: '',
                bank: '',
                debtCollectors: [],
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
```
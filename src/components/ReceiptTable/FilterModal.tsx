import React from 'react';
import { Modal } from '../Modal';
import { useSettingsStore } from '../../store/useSettingsStore';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
    bank: string;
    dateFrom: string;
    dateTo: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string;
    bank: string;
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Receipts">
      <div className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700">Date From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              setFilters({
                status: '',
                bank: '',
                dateFrom: '',
                dateTo: '',
              });
              onClose();
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
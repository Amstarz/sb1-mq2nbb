import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Receipt } from '../types/receipt';
import { format } from 'date-fns';
import { ArrowUpDown, Settings2, Search, Filter, BarChart } from 'lucide-react';
import { Modal } from './Modal';
import { ReceiptDetails } from './ReceiptDetails';
import { useSettingsStore } from '../store/useSettingsStore';
import { ReceiptSummaryReport } from './ReceiptSummaryReport';

const STORAGE_KEY = 'receipt-table-columns';

const columnHelper = createColumnHelper<Receipt>();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-800';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Reconciled':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
};

const ALL_COLUMNS = [
  columnHelper.accessor('dateReceipt', {
    header: 'Date',
    cell: (info) => format(new Date(info.getValue()), 'dd/MM/yyyy'),
  }),
  columnHelper.accessor('bank', {
    header: 'Bank',
  }),
  columnHelper.accessor('receiptAmount', {
    header: 'Amount',
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
          info.getValue()
        )}`}
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('invoiceNumber', {
    header: 'Invoice No',
  }),
  columnHelper.accessor('clientName', {
    header: 'Client Name',
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
  }),
  columnHelper.accessor('debtCollectorName', {
    header: 'Debt Collector',
  }),
  columnHelper.accessor('salesperson', {
    header: 'Salesperson',
  }),
  columnHelper.accessor('remark', {
    header: 'Remark',
  }),
];

interface ReceiptTableProps {
  data: Receipt[];
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ data }) => {
  const { settings } = useSettingsStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    bank: '',
    dateFrom: '',
    dateTo: '',
  });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [
      'dateReceipt',
      'bank',
      'receiptAmount',
      'status',
      'invoiceNumber',
      'clientName',
      'remark',
    ];
  });

  const filteredData = useMemo(() => {
    return data.filter((receipt) => {
      const matchesSearch = Object.values(receipt).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus = !filters.status || receipt.status === filters.status;
      const matchesBank = !filters.bank || receipt.bank === filters.bank;
      const matchesDateRange =
        (!filters.dateFrom ||
          new Date(receipt.dateReceipt) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo ||
          new Date(receipt.dateReceipt) <= new Date(filters.dateTo));

      return matchesSearch && matchesStatus && matchesBank && matchesDateRange;
    });
  }, [data, searchTerm, filters]);

  const columns = useMemo(() => {
    return ALL_COLUMNS.filter((col) => visibleColumns.includes(col.id));
  }, [visibleColumns]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const toggleColumn = (columnId: string) => {
    const newVisibleColumns = visibleColumns.includes(columnId)
      ? visibleColumns.filter((id) => id !== columnId)
      : [...visibleColumns, columnId];
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibleColumns));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipts..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BarChart size={16} />
            {showSummary ? 'Hide Summary' : 'Show Summary'}
          </button>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={16} />
            Filters
            {(filters.status || filters.bank || filters.dateFrom || filters.dateTo) && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Active
              </span>
            )}
          </button>
          <button
            onClick={() => setIsColumnSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings2 size={16} />
            Customize Columns
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="mb-6">
          <ReceiptSummaryReport data={filteredData} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedReceipt(row.original)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Receipt Details"
      >
        {selectedReceipt && (
          <ReceiptDetails
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        title="Customize Columns"
      >
        <div className="grid grid-cols-2 gap-4">
          {ALL_COLUMNS.map((column) => {
            const columnId = column.id;
            return (
              <div key={columnId} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`column-${columnId}`}
                  checked={visibleColumns.includes(columnId)}
                  onChange={() => toggleColumn(columnId)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label
                  htmlFor={`column-${columnId}`}
                  className="text-sm text-gray-700"
                >
                  {typeof column.header === 'string' ? column.header : columnId}
                </label>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Receipts"
      >
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
                  <option key={status.id} value={status.value}>
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
                  <option key={bank.id} value={bank.value}>
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
                setIsFilterModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
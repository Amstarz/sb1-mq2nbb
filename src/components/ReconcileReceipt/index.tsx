import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Receipt } from '../../types/receipt';
import { format } from 'date-fns';
import { Modal } from '../Modal';
import { ReceiptDetails } from '../ReceiptDetails';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useConversationStore } from '../../store/useConversationStore';

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

interface ReconcileReceiptProps {
  data: Receipt[];
}

export const ReconcileReceipt: React.FC<ReconcileReceiptProps> = ({ data }) => {
  const { settings } = useSettingsStore();
  const { conversations, loadConversations } = useConversationStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    bank: '',
    dateFrom: '',
    dateTo: '',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const columns = useMemo(() => [
    columnHelper.accessor('dateReceipt', {
      header: 'Receipt Date',
      cell: (info) => format(new Date(info.getValue()), 'dd/MM/yyyy'),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created Date',
      cell: (info) => format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm'),
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(info.getValue())}`}>
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
    columnHelper.accessor((row) => {
      const conversation = conversations.find(c => c.receiptId === row.id);
      return conversation?.lastMessage || '';
    }, {
      id: 'lastChat',
      header: 'Last Chat',
      cell: (info) => (
        <div className="max-w-xs truncate">
          {info.getValue() || '-'}
        </div>
      ),
    }),
    columnHelper.accessor((row) => {
      const conversation = conversations.find(c => c.receiptId === row.id);
      return conversation?.lastMessageTime || '';
    }, {
      id: 'lastChatTime',
      header: 'Last Chat Time',
      cell: (info) => {
        const value = info.getValue();
        return value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-';
      },
    }),
  ], [conversations]);

  const filteredData = useMemo(() => {
    return data.filter((receipt) => {
      const conversation = conversations.find(c => c.receiptId === receipt.id);
      const searchableValues = [
        ...Object.values(receipt),
        conversation?.lastMessage || '',
      ];

      const matchesSearch = searchableValues.some(
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
  }, [data, searchTerm, filters, conversations]);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
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
        </div>
      </div>

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
                        {header.column.columnDef.header as string}
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
                      {cell.column.columnDef.cell
                        ? cell.column.columnDef.cell(cell.getContext())
                        : cell.getValue() as string}
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
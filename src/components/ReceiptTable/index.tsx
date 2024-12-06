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
import { FilterModal } from './FilterModal';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { SearchControls } from './SearchControls';
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

interface ReceiptTableProps {
  data: Receipt[];
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ data }) => {
  const { conversations } = useConversationStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    bank: '',
    dateFrom: '',
    dateTo: '',
  });

  const columns = useMemo(() => [
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
      <SearchControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        hasActiveFilters={!!(filters.status || filters.bank || filters.dateFrom || filters.dateTo)}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader headerGroups={table.getHeaderGroups()} />
            <TableBody 
              rows={table.getRowModel().rows}
              onRowClick={(receipt) => setSelectedReceipt(receipt)}
            />
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};
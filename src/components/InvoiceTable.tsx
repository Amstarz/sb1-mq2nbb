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
import { Invoice } from '../types/invoice';
import { useReceiptStore } from '../store/useReceiptStore';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown, Settings2, Search, Receipt } from 'lucide-react';
import { Modal } from './Modal';
import { AddInvoiceForm } from './AddInvoiceForm';
import { AddReceiptForm } from './AddReceiptForm';
import { InvoiceDetails } from './InvoiceDetails';

const STORAGE_KEY = 'invoice-table-columns';

const columnHelper = createColumnHelper<Invoice & { amountReceived?: number; balance?: number }>();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Overdue':
      return 'bg-red-100 text-red-800';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800';
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

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const ALL_COLUMNS = [
  columnHelper.accessor('dateInvoice', {
    id: 'dateInvoice',
    header: 'Date',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('numberInvoice', {
    id: 'numberInvoice',
    header: 'Invoice No',
  }),
  columnHelper.accessor('statusInvoice', {
    id: 'statusInvoice',
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
  columnHelper.accessor('branch', {
    id: 'branch',
    header: 'Branch',
  }),
  columnHelper.accessor('clientName', {
    id: 'clientName',
    header: 'Client Name',
  }),
  columnHelper.accessor('amountDue', {
    id: 'amountDue',
    header: 'Amount Due',
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor('amountReceived', {
    id: 'amountReceived',
    header: 'Amount Received',
    cell: (info) => formatCurrency(info.getValue() || 0),
  }),
  columnHelper.accessor('balance', {
    id: 'balance',
    header: 'Balance',
    cell: (info) => {
      const value = info.getValue() || 0;
      return (
        <span className={value > 0 ? 'text-red-600' : 'text-green-600'}>
          {formatCurrency(value)}
        </span>
      );
    },
  }),
  columnHelper.accessor('phoneNumber', {
    id: 'phoneNumber',
    header: 'Phone Number',
  }),
  columnHelper.accessor('phoneNumber2', {
    id: 'phoneNumber2',
    header: 'Phone Number 2',
  }),
  columnHelper.accessor('mykadNo', {
    id: 'mykadNo',
    header: 'MyKad No',
  }),
  columnHelper.accessor('debtCollectorName', {
    id: 'debtCollectorName',
    header: 'Debt Collector',
  }),
  columnHelper.accessor('salesperson', {
    id: 'salesperson',
    header: 'Salesperson',
  }),
  columnHelper.accessor('address', {
    id: 'address',
    header: 'Address',
  }),
  columnHelper.accessor('address2', {
    id: 'address2',
    header: 'Address 2',
  }),
  columnHelper.accessor('city', {
    id: 'city',
    header: 'City',
  }),
  columnHelper.accessor('postcode', {
    id: 'postcode',
    header: 'Postcode',
  }),
  columnHelper.accessor('state', {
    id: 'state',
    header: 'State',
  }),
  columnHelper.accessor('country', {
    id: 'country',
    header: 'Country',
  }),
  columnHelper.accessor('trackingNo', {
    id: 'trackingNo',
    header: 'Tracking No',
  }),
  columnHelper.accessor('totalBoxes', {
    id: 'totalBoxes',
    header: 'Total Boxes',
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            info.table.options.meta?.handleAddReceipt(info.row.original);
          }}
          className="p-1 text-blue-600 hover:text-blue-700"
          title="Add Receipt"
        >
          <Receipt size={20} />
        </button>
      </div>
    ),
  }),
];

interface InvoiceTableProps {
  data: Invoice[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ data }) => {
  const { receipts } = useReceiptStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddReceiptModalOpen, setIsAddReceiptModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [
      'dateInvoice',
      'numberInvoice',
      'statusInvoice',
      'clientName',
      'amountDue',
      'amountReceived',
      'balance',
      'phoneNumber',
      'debtCollectorName',
      'salesperson',
      'actions'
    ];
  });
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  const enrichedData = useMemo(() => {
    return data.map(invoice => {
      const invoiceReceipts = receipts.filter(
        receipt => receipt.invoiceNumber === invoice.numberInvoice && receipt.status === 'Reconciled'
      );
      const amountReceived = invoiceReceipts.reduce(
        (sum, receipt) => sum + receipt.receiptAmount,
        0
      );
      const balance = invoice.amountDue - amountReceived;

      return {
        ...invoice,
        amountReceived,
        balance,
      };
    });
  }, [data, receipts]);

  const columns = useMemo(() => {
    return ALL_COLUMNS.filter(col => visibleColumns.includes(col.id));
  }, [visibleColumns]);

  const filteredData = useMemo(() => {
    return enrichedData.filter((invoice) =>
      Object.values(invoice).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [enrichedData, searchTerm]);

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
    meta: {
      handleAddReceipt: (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsAddReceiptModalOpen(true);
      },
    },
  });

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditModalOpen(true);
    setSelectedInvoice(null);
  };

  const handleAddReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsAddReceiptModalOpen(true);
  };

  const toggleColumn = (columnId: string) => {
    const newVisibleColumns = visibleColumns.includes(columnId)
      ? visibleColumns.filter((id) => id !== columnId)
      : [...visibleColumns, columnId];
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibleColumns));
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          onClick={() => setIsColumnSettingsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Settings2 size={16} />
          Customize Columns
        </button>
      </div>

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
                onClick={() => setSelectedInvoice(row.original)}
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

      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Invoice Details"
      >
        {selectedInvoice && (
          <InvoiceDetails
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onEdit={() => handleEdit(selectedInvoice)}
            onAddReceipt={() => {
              setIsAddReceiptModalOpen(true);
              setSelectedInvoice(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingInvoice(null);
        }}
        title="Edit Invoice"
      >
        <AddInvoiceForm
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingInvoice(null);
          }}
          initialData={editingInvoice}
        />
      </Modal>

      <Modal
        isOpen={isAddReceiptModalOpen}
        onClose={() => {
          setIsAddReceiptModalOpen(false);
          setSelectedInvoice(null);
        }}
        title="Add New Receipt"
      >
        <AddReceiptForm
          onClose={() => {
            setIsAddReceiptModalOpen(false);
            setSelectedInvoice(null);
          }}
          initialInvoice={selectedInvoice}
        />
      </Modal>

      <Modal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        title="Customize Columns"
      >
        <div className="grid grid-cols-2 gap-4">
          {ALL_COLUMNS.map((column) => (
            <div key={column.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`column-${column.id}`}
                checked={visibleColumns.includes(column.id)}
                onChange={() => toggleColumn(column.id)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <label 
                htmlFor={`column-${column.id}`}
                className="text-sm text-gray-700"
              >
                {typeof column.header === 'string' ? column.header : column.id}
              </label>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
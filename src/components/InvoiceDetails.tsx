import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import { Receipt } from '../types/receipt';
import { useReceiptStore } from '../store/useReceiptStore';
import { format } from 'date-fns';
import { Receipt as ReceiptIcon, Edit, Plus } from 'lucide-react';
import { Modal } from './Modal';
import { ReceiptDetails } from './ReceiptDetails';
import { AddReceiptForm } from './AddReceiptForm';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  onClose,
  onEdit,
}) => {
  const { receipts } = useReceiptStore();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isAddReceiptModalOpen, setIsAddReceiptModalOpen] = useState(false);
  
  const invoiceReceipts = receipts.filter(
    (receipt) => receipt.invoiceNumber === invoice.numberInvoice
  );

  const reconciledReceipts = invoiceReceipts.filter(
    (receipt) => receipt.status === 'Reconciled'
  );

  const totalReconciledAmount = reconciledReceipts.reduce(
    (sum, receipt) => sum + receipt.receiptAmount,
    0
  );

  const remainingBalance = invoice.amountDue - totalReconciledAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const renderField = (label: string, value: string | number | null) => {
    if (value === null || value === '') return null;
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <div className="mt-1 text-sm text-gray-900">{value}</div>
      </div>
    );
  };

  const handleReceiptClick = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Created on {format(new Date(invoice.dateInvoice), 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => setIsAddReceiptModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Receipt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderField('Invoice Number', invoice.numberInvoice)}
          {renderField('Status', invoice.statusInvoice)}
          {renderField('Branch', invoice.branch)}
          {renderField('Client Name', invoice.clientName)}
          {renderField('Amount Due', formatCurrency(invoice.amountDue))}
          {renderField('Amount Received', formatCurrency(totalReconciledAmount))}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500">
              Remaining Balance
            </label>
            <div className={`mt-1 text-sm ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
              {formatCurrency(remainingBalance)}
            </div>
          </div>
          {renderField('Phone Number', invoice.phoneNumber)}
          {renderField('Phone Number 2', invoice.phoneNumber2)}
          {renderField('MyKad No', invoice.mykadNo)}
          {renderField('Debt Collector', invoice.debtCollectorName)}
          {renderField('Salesperson', invoice.salesperson)}
        </div>

        <div className="space-y-4">
          {renderField('Address', invoice.address)}
          {renderField('Address 2', invoice.address2)}
          {renderField('City', invoice.city)}
          {renderField('Postcode', invoice.postcode)}
          {renderField('State', invoice.state)}
          {renderField('Country', invoice.country)}
          {renderField('Tracking No', invoice.trackingNo)}
          {renderField('Total Boxes', invoice.totalBoxes)}
          {invoice.ptp && (
            <>
              {renderField('PTP Date', format(new Date(invoice.ptpDate!), 'dd/MM/yyyy'))}
              {renderField('PTP Amount', formatCurrency(invoice.ptpAmount!))}
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Receipts</h4>
          <div className="flex gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Total Reconciled:</span>{' '}
              <span className="font-medium text-gray-900">
                {formatCurrency(totalReconciledAmount)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Remaining:</span>{' '}
              <span className={`font-medium ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>
        </div>

        {invoiceReceipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceReceipts.map((receipt) => (
                  <tr 
                    key={receipt.id}
                    onClick={() => handleReceiptClick(receipt)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(receipt.dateReceipt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.bank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(receipt.receiptAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          receipt.status === 'Reconciled'
                            ? 'bg-green-100 text-green-800'
                            : receipt.status === 'New'
                            ? 'bg-blue-100 text-blue-800'
                            : receipt.status === 'On Hold'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ReceiptIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new receipt.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddReceiptModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Receipt
              </button>
            </div>
          </div>
        )}
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
        isOpen={isAddReceiptModalOpen}
        onClose={() => setIsAddReceiptModalOpen(false)}
        title="Add New Receipt"
      >
        <AddReceiptForm
          onClose={() => setIsAddReceiptModalOpen(false)}
          initialInvoice={invoice}
        />
      </Modal>
    </div>
  );
};
import React, { useState } from 'react';
import { Receipt } from '../types/receipt';
import { useReceiptStore } from '../store/useReceiptStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ImageModal } from './ImageModal';
import { Search, MessageCircle } from 'lucide-react';
import { ChatConversation } from './ChatConversation';

interface ReceiptDetailsProps {
  receipt: Receipt;
  onClose: () => void;
}

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

export const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({
  receipt,
  onClose,
}) => {
  const { updateReceipt } = useReceiptStore();
  const { settings } = useSettingsStore();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updatedReceipt = {
        ...receipt,
        status: newStatus as Receipt['status'],
      };
      await updateReceipt(receipt.id, updatedReceipt);
      toast.success('Receipt status updated successfully');
    } catch (error) {
      toast.error('Error updating receipt status');
    }
  };

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

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Receipt Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Created on {format(new Date(receipt.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <button
          onClick={() => setShowChat(!showChat)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <MessageCircle size={16} />
          {showChat ? 'Hide Chat' : 'Show Chat'}
        </button>
      </div>

      {showChat ? (
        <ChatConversation receiptId={receipt.id} userName="User" />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {renderField('Invoice Number', receipt.invoiceNumber)}
            {renderField('Client Name', receipt.clientName)}
            {renderField('Phone Number', receipt.phoneNumber)}
            {renderField('Date', format(new Date(receipt.dateReceipt), 'dd/MM/yyyy'))}
            {renderField('Bank', receipt.bank)}
            {renderField('Amount', formatCurrency(receipt.receiptAmount))}
            {renderField('Debt Collector', receipt.debtCollectorName)}
            {renderField('Salesperson', receipt.salesperson)}
            {renderField('Remark', receipt.remark)}
          </div>

          <div className="space-y-4">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Status
              </label>
              <div className="grid grid-cols-1 gap-2">
                {settings.receiptStatuses
                  .filter((status) => status.isActive)
                  .map((status) => (
                    <button
                      key={status.id}
                      onClick={() => handleStatusChange(status.value)}
                      className={`p-2 rounded-lg text-sm font-medium ${
                        receipt.status === status.value
                          ? 'ring-2 ring-blue-500 ' + getStatusColor(status.value)
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {status.value}
                    </button>
                  ))}
              </div>
            </div>

            {receipt.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Receipt Image
                </label>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={receipt.imageUrl}
                    alt="Receipt"
                    className="max-w-full rounded-lg shadow-sm transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {receipt.imageUrl && (
        <ImageModal
          imageUrl={receipt.imageUrl}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
};
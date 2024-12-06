import React, { useState, useEffect } from 'react';
import { useReceiptStore } from '../store/useReceiptStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useConversationStore } from '../store/useConversationStore';
import { Receipt } from '../types/receipt';
import { Invoice } from '../types/invoice';
import { ChatConversation } from './ChatConversation';
import toast from 'react-hot-toast';
import { Search, MessageCircle, Upload } from 'lucide-react';
import { ImageModal } from './ImageModal';

interface AddReceiptFormProps {
  onClose: () => void;
  initialData?: Receipt | null;
  initialInvoice?: Invoice | null;
}

export const AddReceiptForm: React.FC<AddReceiptFormProps> = ({
  onClose,
  initialData,
  initialInvoice,
}) => {
  const { addReceipt, updateReceipt } = useReceiptStore();
  const { settings } = useSettingsStore();
  const { invoices } = useInvoiceStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [formData, setFormData] = useState<Partial<Receipt>>({
    dateReceipt: new Date().toISOString().split('T')[0],
    bank: '',
    receiptAmount: 0,
    remark: '',
    imageUrl: '',
    status: 'New',
    invoiceNumber: '',
    clientName: '',
    phoneNumber: '',
    debtCollectorName: '',
    salesperson: '',
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dateReceipt: new Date(initialData.dateReceipt).toISOString().split('T')[0],
      });
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    } else if (initialInvoice) {
      setFormData((prev) => ({
        ...prev,
        invoiceNumber: initialInvoice.numberInvoice,
        clientName: initialInvoice.clientName,
        phoneNumber: initialInvoice.phoneNumber,
        debtCollectorName: initialInvoice.debtCollectorName || '',
        salesperson: initialInvoice.salesperson,
      }));
    }
  }, [initialData, initialInvoice]);

  const handleInvoiceSelect = (invoiceNumber: string) => {
    const selectedInvoice = invoices.find(
      (inv) => inv.numberInvoice === invoiceNumber
    );
    if (selectedInvoice) {
      setFormData((prev) => ({
        ...prev,
        invoiceNumber: selectedInvoice.numberInvoice,
        clientName: selectedInvoice.clientName,
        phoneNumber: selectedInvoice.phoneNumber,
        debtCollectorName: selectedInvoice.debtCollectorName || '',
        salesperson: selectedInvoice.salesperson,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bank || !formData.receiptAmount) {
      toast.error('Bank and Amount are required');
      return;
    }

    const receipt: Receipt = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData as Receipt,
    };

    try {
      if (initialData) {
        await updateReceipt(initialData.id, receipt);
        toast.success('Receipt updated successfully');
      } else {
        await addReceipt(receipt);
        toast.success('Receipt added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Error saving receipt');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Receipt Details</h3>
        {initialData && (
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <MessageCircle size={16} />
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
        )}
      </div>

      {showChat && initialData ? (
        <ChatConversation receiptId={initialData.id} userName="User" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <select
                value={formData.invoiceNumber}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!!initialInvoice}
              >
                <option value="">Select Invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.numberInvoice}>
                    {invoice.numberInvoice} - {invoice.clientName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Debt Collector
              </label>
              <input
                type="text"
                value={formData.debtCollectorName}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salesperson
              </label>
              <input
                type="text"
                value={formData.salesperson}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.dateReceipt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dateReceipt: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bank</label>
              <select
                value={formData.bank}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bank: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Bank</option>
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
              <label className="block text-sm font-medium text-gray-700">
                Amount (MYR)
              </label>
              <input
                type="number"
                value={formData.receiptAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    receiptAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as Receipt['status'],
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {settings.receiptStatuses
                  .filter((status) => status.isActive)
                  .map((status) => (
                    <option key={status.id} value={status.value}>
                      {status.value}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Remark
              </label>
              <textarea
                value={formData.remark}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remark: e.target.value }))
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Image
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-image"
                />
                <label
                  htmlFor="receipt-image"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Click to upload
                </label>
                <span className="text-gray-500"> or drag and drop</span>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="max-h-48 mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
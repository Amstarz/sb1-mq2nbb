import React, { useState, useEffect } from 'react';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Invoice } from '../types/invoice';
import toast from 'react-hot-toast';

interface AddInvoiceFormProps {
  onClose: () => void;
  initialData?: Invoice | null;
}

export const AddInvoiceForm: React.FC<AddInvoiceFormProps> = ({
  onClose,
  initialData,
}) => {
  const { addInvoice, updateInvoice } = useInvoiceStore();
  const { settings } = useSettingsStore();

  const [formData, setFormData] = useState<Partial<Invoice>>({
    dateInvoice: new Date().toISOString().split('T')[0],
    numberInvoice: '',
    statusInvoice: 'Pending',
    branch: '',
    clientName: '',
    amountDue: 0,
    phoneNumber: '',
    phoneNumber2: '',
    mykadNo: '',
    debtCollectorName: '',
    salesperson: '',
    address: '',
    address2: '',
    city: '',
    postcode: '',
    state: '',
    country: 'Malaysia',
    trackingNo: '',
    ptp: false,
    totalBoxes: 0,
    ptpDate: '',
    ptpAmount: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dateInvoice: initialData.dateInvoice ? new Date(initialData.dateInvoice).toISOString().split('T')[0] : '',
        ptpDate: initialData.ptpDate ? new Date(initialData.ptpDate).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numberInvoice) {
      toast.error('Invoice number is required');
      return;
    }

    const invoice: Invoice = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData as Invoice,
    };

    try {
      if (initialData) {
        await updateInvoice(initialData.id, invoice);
        toast.success('Invoice updated successfully');
      } else {
        await addInvoice(invoice);
        toast.success('Invoice added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Error saving invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice Date
          </label>
          <input
            type="date"
            value={formData.dateInvoice}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dateInvoice: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Invoice Number
          </label>
          <input
            type="text"
            value={formData.numberInvoice}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, numberInvoice: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={formData.statusInvoice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                statusInvoice: e.target.value as Invoice['statusInvoice'],
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {settings.statuses
              .filter((status) => status.isActive)
              .map((status) => (
                <option key={status.id} value={status.value}>
                  {status.value}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Branch
          </label>
          <select
            value={formData.branch}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, branch: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Branch</option>
            {settings.branches
              .filter((branch) => branch.isActive)
              .map((branch) => (
                <option key={branch.id} value={branch.value}>
                  {branch.value}
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, clientName: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount Due (MYR)
          </label>
          <input
            type="number"
            value={formData.amountDue}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amountDue: parseFloat(e.target.value) || 0,
              }))
            }
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number 2
          </label>
          <input
            type="text"
            value={formData.phoneNumber2}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phoneNumber2: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            MyKad No
          </label>
          <input
            type="text"
            value={formData.mykadNo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, mykadNo: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Debt Collector
          </label>
          <select
            value={formData.debtCollectorName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                debtCollectorName: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Debt Collector</option>
            {settings.debtCollectors
              .filter((collector) => collector.isActive)
              .map((collector) => (
                <option key={collector.id} value={collector.value}>
                  {collector.value}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salesperson
          </label>
          <select
            value={formData.salesperson}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, salesperson: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Salesperson</option>
            {settings.salespeople
              .filter((person) => person.isActive)
              .map((person) => (
                <option key={person.id} value={person.value}>
                  {person.value}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address 2
          </label>
          <input
            type="text"
            value={formData.address2}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address2: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, city: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Postcode
          </label>
          <input
            type="text"
            value={formData.postcode}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, postcode: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, state: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, country: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tracking No
          </label>
          <input
            type="text"
            value={formData.trackingNo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, trackingNo: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Boxes
          </label>
          <input
            type="number"
            value={formData.totalBoxes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                totalBoxes: parseInt(e.target.value) || 0,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.ptp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ptp: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Promise to Pay (PTP)
            </label>
          </div>
        </div>

        {formData.ptp && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                PTP Date
              </label>
              <input
                type="date"
                value={formData.ptpDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ptpDate: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                PTP Amount (MYR)
              </label>
              <input
                type="number"
                value={formData.ptpAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ptpAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};
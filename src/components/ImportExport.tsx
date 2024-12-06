import React, { useCallback } from 'react';
import { Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { Invoice } from '../types/invoice';
import toast from 'react-hot-toast';

export const ImportExport: React.FC = () => {
  const { setInvoices, invoices } = useInvoiceStore();

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const parsedData = results.data.slice(1).map((row: any) => ({
            id: crypto.randomUUID(),
            dateInvoice: row[0],
            numberInvoice: row[1],
            statusInvoice: row[2],
            branch: row[3],
            clientName: row[4],
            amountDue: parseFloat(row[5]),
            phoneNumber: row[6],
            phoneNumber2: row[7],
            mykadNo: row[8],
            debtCollectorName: row[9],
            salesperson: row[10],
            address: row[11],
            address2: row[12],
            city: row[13],
            postcode: row[14],
            state: row[15],
            country: row[16],
            trackingNo: row[17],
            ptp: row[18] === 'true',
            totalBoxes: parseInt(row[19]),
            ptpDate: row[20],
            ptpAmount: row[21] ? parseFloat(row[21]) : undefined,
          }));
          setInvoices(parsedData as Invoice[]);
          toast.success('Data imported successfully');
        },
        header: true,
        error: () => {
          toast.error('Error importing data');
        },
      });
    }
  }, [setInvoices]);

  const handleExport = useCallback(() => {
    const csv = Papa.unparse(invoices);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'invoices.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported successfully');
  }, [invoices]);

  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
        <Upload size={20} />
        Import CSV
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImport}
        />
      </label>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        <Download size={20} />
        Export CSV
      </button>
    </div>
  );
};
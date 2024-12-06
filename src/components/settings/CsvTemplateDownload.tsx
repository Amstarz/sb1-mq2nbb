import React from 'react';
import { Download } from 'lucide-react';

export const CsvTemplateDownload: React.FC = () => {
  const generateTemplate = () => {
    const headers = [
      'Date Invoice',
      'Number Invoice',
      'Status Invoice',
      'Branch',
      'Client Name',
      'Amount Due',
      'Phone Number',
      'Phone Number 2',
      'Mykad No',
      'Debt Collector Name',
      'Salesperson',
      'Address',
      'Address 2',
      'City',
      'Postcode',
      'State',
      'Country',
      'Tracking No',
      'PTP',
      'Total Boxes',
      'PTP Date',
      'PTP Amount'
    ];

    const sampleData = [
      '2024-03-15',
      'INV-001',
      'Pending',
      'Branch A',
      'John Doe',
      '1000.00',
      '0123456789',
      '0123456788',
      '123456789012',
      'Collector A',
      'Sales A',
      '123 Main Street',
      'Unit 4B',
      'Kuala Lumpur',
      '50000',
      'Wilayah Persekutuan',
      'Malaysia',
      'TRK001',
      'false',
      '2',
      '',
      ''
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'invoice_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">CSV Template</h2>
      <div className="prose prose-sm text-gray-500 mb-4">
        <p>Download a CSV template for importing invoices. The template includes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All required fields with proper formatting</li>
          <li>Sample data for reference</li>
          <li>Date format: YYYY-MM-DD</li>
          <li>Amount format: Numbers with 2 decimal places</li>
          <li>PTP (Promise to Pay): 'true' or 'false'</li>
        </ul>
      </div>
      <button
        onClick={generateTemplate}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Download size={20} />
        Download Template
      </button>
    </div>
  );
};
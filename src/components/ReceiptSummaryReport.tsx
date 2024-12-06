import React, { useMemo } from 'react';
import { Receipt } from '../types/receipt';
import { BarChart, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptSummaryReportProps {
  data: Receipt[];
}

export const ReceiptSummaryReport: React.FC<ReceiptSummaryReportProps> = ({ data }) => {
  const summary = useMemo(() => {
    const totalReceipts = data.length;
    const totalAmount = data.reduce((sum, receipt) => sum + receipt.receiptAmount, 0);
    const reconciledReceipts = data.filter(r => r.status === 'Reconciled');
    const reconciledAmount = reconciledReceipts.reduce((sum, receipt) => sum + receipt.receiptAmount, 0);
    
    const statusCounts = data.reduce((acc, receipt) => {
      acc[receipt.status] = (acc[receipt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bankSummary = data.reduce((acc, receipt) => {
      if (!acc[receipt.bank]) {
        acc[receipt.bank] = {
          count: 0,
          amount: 0,
        };
      }
      acc[receipt.bank].count++;
      acc[receipt.bank].amount += receipt.receiptAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    // Get today's receipts
    const today = new Date().toISOString().split('T')[0];
    const todayReceipts = data.filter(r => r.dateReceipt.startsWith(today));
    const todayAmount = todayReceipts.reduce((sum, receipt) => sum + receipt.receiptAmount, 0);

    return {
      totalReceipts,
      totalAmount,
      reconciledReceipts: reconciledReceipts.length,
      reconciledAmount,
      statusCounts,
      bankSummary,
      todayReceipts: todayReceipts.length,
      todayAmount,
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-blue-600" />
          Receipt Summary Report
          <span className="text-sm font-normal text-gray-500 ml-2">
            as of {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Statistics */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Clock className="h-5 w-5" />
              <h3 className="font-medium">Today's Activity</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-700">
                {summary.todayReceipts}
              </p>
              <p className="text-sm text-blue-600">New Receipts</p>
              <p className="text-lg font-semibold text-blue-700">
                {formatCurrency(summary.todayAmount)}
              </p>
            </div>
          </div>

          {/* Total Statistics */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <DollarSign className="h-5 w-5" />
              <h3 className="font-medium">Total Collections</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-700">
                {summary.totalReceipts}
              </p>
              <p className="text-sm text-green-600">Total Receipts</p>
              <p className="text-lg font-semibold text-green-700">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
          </div>

          {/* Reconciled Statistics */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-medium">Reconciled</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-700">
                {summary.reconciledReceipts}
              </p>
              <p className="text-sm text-purple-600">Reconciled Receipts</p>
              <p className="text-lg font-semibold text-purple-700">
                {formatCurrency(summary.reconciledAmount)}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-2">Status Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(summary.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{status}</span>
                  <span className="font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bank Summary */}
        <div className="mt-8">
          <h3 className="font-medium text-gray-900 mb-4">Collections by Bank</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Receipts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(summary.bankSummary).map(([bank, { count, amount }]) => (
                  <tr key={bank}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
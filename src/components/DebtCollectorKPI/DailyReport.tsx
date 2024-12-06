import React, { useMemo, useState } from 'react';
import { Receipt } from '../../types/receipt';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useSettingsStore } from '../../store/useSettingsStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';

interface DailyReportProps {
  receipts: Receipt[];
  selectedMonth?: Date;
  dateType?: 'receiptDate' | 'createdAt';
}

export const DailyReport: React.FC<DailyReportProps> = ({ 
  receipts, 
  selectedMonth = new Date(),
  dateType = 'receiptDate'
}) => {
  const { settings } = useSettingsStore();
  const activeCollectors = settings.debtCollectors.filter(c => c.isActive);
  const [view, setView] = useState<'table' | 'chart'>('table');

  const days = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  }, [selectedMonth]);

  const dailyStats = useMemo(() => {
    const stats = new Map<string, Map<string, { 
      amount: number; 
      totalReceipts: number;
      reconciledReceipts: number;
    }>>();

    // Initialize stats for all collectors and days
    activeCollectors.forEach(collector => {
      const dailyMap = new Map<string, { 
        amount: number; 
        totalReceipts: number;
        reconciledReceipts: number;
      }>();
      days.forEach(day => {
        dailyMap.set(format(day, 'yyyy-MM-dd'), { 
          amount: 0, 
          totalReceipts: 0,
          reconciledReceipts: 0,
        });
      });
      stats.set(collector.value, dailyMap);
    });

    // Calculate stats
    receipts.forEach(receipt => {
      const date = format(new Date(dateType === 'receiptDate' ? receipt.dateReceipt : receipt.createdAt), 'yyyy-MM-dd');
      const collectorStats = stats.get(receipt.debtCollectorName);
      if (collectorStats && collectorStats.has(date)) {
        const dayStats = collectorStats.get(date)!;
        if (receipt.status === 'Reconciled') {
          dayStats.amount += receipt.receiptAmount;
          dayStats.reconciledReceipts += 1;
        }
        dayStats.totalReceipts += 1;
        collectorStats.set(date, dayStats);
      }
    });

    return stats;
  }, [receipts, activeCollectors, days, dateType]);

  const chartData = useMemo(() => {
    return days.map(day => {
      const date = format(day, 'yyyy-MM-dd');
      const dayData: any = {
        date: format(day, 'dd MMM'),
      };

      activeCollectors.forEach(collector => {
        const collectorStats = dailyStats.get(collector.value);
        const dayStats = collectorStats?.get(date);
        if (dayStats) {
          dayData[collector.value] = dayStats.amount;
        }
      });

      return dayData;
    });
  }, [days, activeCollectors, dailyStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Daily Collection Report - {format(selectedMonth, 'MMMM yyyy')}
            <span className="text-sm font-normal text-gray-500 ml-2">
              (By {dateType === 'receiptDate' ? 'Receipt Date' : 'Created Date'})
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-lg ${
                view === 'table' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Table View"
            >
              <Table2 size={20} />
            </button>
            <button
              onClick={() => setView('chart')}
              className={`p-2 rounded-lg ${
                view === 'chart' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Chart View"
            >
              <BarChart3 size={20} />
            </button>
          </div>
        </div>

        {view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Debt Collector
                  </th>
                  {days.map(day => (
                    <th key={day.toString()} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div>{format(day, 'dd')}</div>
                      <div className="text-gray-400">{format(day, 'EEE')}</div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeCollectors.map(collector => {
                  const collectorStats = dailyStats.get(collector.value);
                  const totals = Array.from(collectorStats?.values() || []).reduce(
                    (acc, day) => ({
                      amount: acc.amount + day.amount,
                      totalReceipts: acc.totalReceipts + day.totalReceipts,
                      reconciledReceipts: acc.reconciledReceipts + day.reconciledReceipts,
                    }),
                    { amount: 0, totalReceipts: 0, reconciledReceipts: 0 }
                  );

                  return (
                    <tr key={collector.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        {collector.value}
                      </td>
                      {days.map(day => {
                        const dayStats = collectorStats?.get(format(day, 'yyyy-MM-dd'));
                        return (
                          <td key={day.toString()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayStats && (dayStats.amount > 0 || dayStats.totalReceipts > 0) ? (
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(dayStats.amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dayStats.reconciledReceipts} of {dayStats.totalReceipts} receipts
                                </div>
                                <div className="text-xs text-gray-500">
                                  {((dayStats.reconciledReceipts / dayStats.totalReceipts) * 100).toFixed(1)}% success
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm bg-blue-50">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(totals.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {totals.reconciledReceipts} of {totals.totalReceipts} receipts
                          </div>
                          <div className="text-xs text-gray-500">
                            {((totals.reconciledReceipts / totals.totalReceipts) * 100).toFixed(1)}% success
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.375rem',
                  }}
                />
                <Legend />
                {activeCollectors.map((collector, index) => (
                  <Bar
                    key={collector.id}
                    dataKey={collector.value}
                    name={collector.value}
                    fill={`hsl(${index * (360 / activeCollectors.length)}, 70%, 50%)`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
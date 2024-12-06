import React, { useMemo, useState } from 'react';
import { Invoice } from '../../types/invoice';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useSettingsStore } from '../../store/useSettingsStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';

interface DailyReportProps {
  invoices: Invoice[];
  selectedMonth?: Date;
}

export const DailyReport: React.FC<DailyReportProps> = ({ 
  invoices, 
  selectedMonth = new Date() 
}) => {
  const { settings } = useSettingsStore();
  const activeBranches = settings.branches.filter(b => b.isActive);
  const [view, setView] = useState<'table' | 'chart'>('table');

  const days = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  }, [selectedMonth]);

  const dailyStats = useMemo(() => {
    const stats = new Map<string, Map<string, { 
      amount: number; 
      boxes: number; 
      invoices: number;
      salespeople: Set<string>;
    }>>();

    // Initialize stats for all branches and days
    activeBranches.forEach(branch => {
      const dailyMap = new Map<string, { 
        amount: number; 
        boxes: number; 
        invoices: number;
        salespeople: Set<string>;
      }>();
      days.forEach(day => {
        dailyMap.set(format(day, 'yyyy-MM-dd'), { 
          amount: 0, 
          boxes: 0, 
          invoices: 0,
          salespeople: new Set(),
        });
      });
      stats.set(branch.value, dailyMap);
    });

    // Calculate stats
    invoices.forEach(invoice => {
      const date = format(new Date(invoice.dateInvoice), 'yyyy-MM-dd');
      const branchStats = stats.get(invoice.branch);
      if (branchStats && branchStats.has(date)) {
        const dayStats = branchStats.get(date)!;
        dayStats.amount += invoice.amountDue;
        dayStats.boxes += invoice.totalBoxes;
        dayStats.invoices += 1;
        if (invoice.salesperson) {
          dayStats.salespeople.add(invoice.salesperson);
        }
        branchStats.set(date, dayStats);
      }
    });

    return stats;
  }, [invoices, activeBranches, days]);

  const chartData = useMemo(() => {
    return days.map(day => {
      const date = format(day, 'yyyy-MM-dd');
      const dayData: any = {
        date: format(day, 'dd MMM'),
      };

      activeBranches.forEach(branch => {
        const branchStats = dailyStats.get(branch.value);
        const dayStats = branchStats?.get(date);
        if (dayStats) {
          dayData[branch.value] = dayStats.amount;
        }
      });

      return dayData;
    });
  }, [days, activeBranches, dailyStats]);

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
            Daily Branch Performance Report - {format(selectedMonth, 'MMMM yyyy')}
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
                    Branch
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
                {activeBranches.map(branch => {
                  const branchStats = dailyStats.get(branch.value);
                  const totals = Array.from(branchStats?.values() || []).reduce(
                    (acc, day) => ({
                      amount: acc.amount + day.amount,
                      boxes: acc.boxes + day.boxes,
                      invoices: acc.invoices + day.invoices,
                      salespeople: new Set([...acc.salespeople, ...day.salespeople]),
                    }),
                    { amount: 0, boxes: 0, invoices: 0, salespeople: new Set<string>() }
                  );

                  return (
                    <tr key={branch.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        {branch.value}
                      </td>
                      {days.map(day => {
                        const dayStats = branchStats?.get(format(day, 'yyyy-MM-dd'));
                        return (
                          <td key={day.toString()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayStats && (dayStats.amount > 0 || dayStats.boxes > 0) ? (
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(dayStats.amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dayStats.boxes} boxes
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dayStats.invoices} inv • {dayStats.salespeople.size} sales
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
                            {totals.boxes} boxes
                          </div>
                          <div className="text-xs text-gray-500">
                            {totals.invoices} inv • {totals.salespeople.size} sales
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
                {activeBranches.map((branch, index) => (
                  <Bar
                    key={branch.id}
                    dataKey={branch.value}
                    name={branch.value}
                    fill={`hsl(${index * (360 / activeBranches.length)}, 70%, 50%)`}
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
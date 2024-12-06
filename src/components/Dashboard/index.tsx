import React from 'react';
import { Invoice } from '../../types/invoice';
import { Receipt } from '../../types/receipt';
import { useSettingsStore } from '../../store/useSettingsStore';
import { format } from 'date-fns';
import { 
  FileSpreadsheet, 
  Receipt as ReceiptIcon, 
  Building2, 
  Users, 
  DollarSign,
  Package,
  TrendingUp,
  Target,
  Medal
} from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  receipts: Receipt[];
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, receipts }) => {
  const { settings } = useSettingsStore();

  // Invoice Summary
  const invoiceSummary = React.useMemo(() => {
    const total = invoices.reduce((acc, inv) => acc + inv.amountDue, 0);
    const totalBoxes = invoices.reduce((acc, inv) => acc + inv.totalBoxes, 0);
    const statusCounts = invoices.reduce((acc, inv) => {
      acc[inv.statusInvoice] = (acc[inv.statusInvoice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalBoxes,
      count: invoices.length,
      statusCounts,
    };
  }, [invoices]);

  // Receipt Summary
  const receiptSummary = React.useMemo(() => {
    const total = receipts.reduce((acc, rec) => acc + rec.receiptAmount, 0);
    const statusCounts = receipts.reduce((acc, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      count: receipts.length,
      statusCounts,
    };
  }, [receipts]);

  // Branch Summary
  const branchSummary = React.useMemo(() => {
    const branchStats = invoices.reduce((acc, inv) => {
      if (!acc[inv.branch]) {
        acc[inv.branch] = {
          total: 0,
          count: 0,
          boxes: 0,
          salespeople: new Set(),
        };
      }
      acc[inv.branch].total += inv.amountDue;
      acc[inv.branch].count += 1;
      acc[inv.branch].boxes += inv.totalBoxes;
      if (inv.salesperson) {
        acc[inv.branch].salespeople.add(inv.salesperson);
      }
      return acc;
    }, {} as Record<string, { total: number; count: number; boxes: number; salespeople: Set<string> }>);

    return Object.entries(branchStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        count: stats.count,
        boxes: stats.boxes,
        salespeople: stats.salespeople.size,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices]);

  // Debt Collector Summary
  const collectorSummary = React.useMemo(() => {
    const collectorStats = receipts.reduce((acc, rec) => {
      if (!rec.debtCollectorName) return acc;
      if (!acc[rec.debtCollectorName]) {
        acc[rec.debtCollectorName] = {
          collected: 0,
          count: 0,
          reconciled: 0,
        };
      }
      acc[rec.debtCollectorName].collected += rec.receiptAmount;
      acc[rec.debtCollectorName].count += 1;
      if (rec.status === 'Reconciled') {
        acc[rec.debtCollectorName].reconciled += 1;
      }
      return acc;
    }, {} as Record<string, { collected: number; count: number; reconciled: number }>);

    return Object.entries(collectorStats)
      .map(([name, stats]) => ({
        name,
        collected: stats.collected,
        count: stats.count,
        successRate: (stats.reconciled / stats.count) * 100,
      }))
      .sort((a, b) => b.collected - a.collected)
      .slice(0, 5);
  }, [receipts]);

  // Salesperson Summary
  const salespersonSummary = React.useMemo(() => {
    const salesStats = invoices.reduce((acc, inv) => {
      if (!inv.salesperson) return acc;
      if (!acc[inv.salesperson]) {
        acc[inv.salesperson] = {
          total: 0,
          count: 0,
          boxes: 0,
          branch: inv.branch,
        };
      }
      acc[inv.salesperson].total += inv.amountDue;
      acc[inv.salesperson].count += 1;
      acc[inv.salesperson].boxes += inv.totalBoxes;
      return acc;
    }, {} as Record<string, { total: number; count: number; boxes: number; branch: string }>);

    return Object.entries(salesStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        count: stats.count,
        boxes: stats.boxes,
        branch: stats.branch,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Invoice & Receipt Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Invoice Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(invoiceSummary.total)}
              </div>
              <div className="text-sm text-blue-600">
                {invoiceSummary.count} invoices
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Total Boxes</div>
              <div className="text-2xl font-bold text-green-700">
                {invoiceSummary.totalBoxes}
              </div>
              <div className="text-sm text-green-600">
                Avg: {(invoiceSummary.totalBoxes / invoiceSummary.count || 0).toFixed(1)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(invoiceSummary.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{status}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Receipt Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ReceiptIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Receipt Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Total Collected</div>
              <div className="text-2xl font-bold text-purple-700">
                {formatCurrency(receiptSummary.total)}
              </div>
              <div className="text-sm text-purple-600">
                {receiptSummary.count} receipts
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-sm text-indigo-600 mb-1">Collection Rate</div>
              <div className="text-2xl font-bold text-indigo-700">
                {((receiptSummary.total / invoiceSummary.total) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-indigo-600">
                of total invoices
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(receiptSummary.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{status}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Top Branches</h3>
          </div>
          <div className="space-y-4">
            {branchSummary.map((branch, index) => (
              <div key={branch.name} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{branch.name.charAt(0)}</span>
                  </div>
                  {index < 3 && (
                    <Medal 
                      className={`absolute -top-1 -right-1 w-4 h-4 ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        'text-amber-600'
                      }`} 
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{branch.name}</div>
                  <div className="text-sm text-gray-500">
                    {branch.salespeople} salespeople • {branch.boxes} boxes
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatCurrency(branch.total)}</div>
                  <div className="text-sm text-gray-500">{branch.count} invoices</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debt Collector Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Top Collectors</h3>
          </div>
          <div className="space-y-4">
            {collectorSummary.map((collector, index) => {
              const profile = settings.debtCollectors.find(c => c.value === collector.name);
              return (
                <div key={collector.name} className="flex items-center gap-4">
                  <div className="relative">
                    {profile?.imageUrl ? (
                      <img 
                        src={profile.imageUrl} 
                        alt={collector.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {collector.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {index < 3 && (
                      <Medal 
                        className={`absolute -top-1 -right-1 w-4 h-4 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-amber-600'
                        }`} 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{collector.name}</div>
                    <div className="text-sm text-gray-500">
                      {collector.count} receipts • {collector.successRate.toFixed(1)}% success
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(collector.collected)}
                    </div>
                    <div className="text-sm text-green-600">Collected</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salesperson Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Top Salespeople</h3>
          </div>
          <div className="space-y-4">
            {salespersonSummary.map((person, index) => {
              const profile = settings.salespeople.find(s => s.value === person.name);
              return (
                <div key={person.name} className="flex items-center gap-4">
                  <div className="relative">
                    {profile?.imageUrl ? (
                      <img 
                        src={profile.imageUrl} 
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {person.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {index < 3 && (
                      <Medal 
                        className={`absolute -top-1 -right-1 w-4 h-4 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-amber-600'
                        }`} 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{person.name}</div>
                    <div className="text-sm text-gray-500">
                      {person.branch} • {person.boxes} boxes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(person.total)}
                    </div>
                    <div className="text-sm text-gray-500">{person.count} invoices</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
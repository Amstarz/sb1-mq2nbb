import React, { useMemo, useState } from 'react';
import { Receipt } from '../../types/receipt';
import { Invoice } from '../../types/invoice';
import { format } from 'date-fns';
import { TrendingUp, Users, DollarSign, Target, BarChart3, Filter, Calendar } from 'lucide-react';
import { KPITargets } from './KPITargets';
import { CompanyKPI } from './CompanyKPI';
import { KPIFilters } from './KPIFilters';
import { Leaderboard } from './Leaderboard';
import { DailyReport } from './DailyReport';

interface DebtCollectorKPIProps {
  receipts: Receipt[];
  invoices: Invoice[];
}

export const DebtCollectorKPI: React.FC<DebtCollectorKPIProps> = ({ receipts, invoices }) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeView, setActiveView] = useState<'overview' | 'daily'>('overview');
  const [filters, setFilters] = useState({
    debtCollectors: [] as string[],
    dateRange: 'monthly',
    dateFrom: '',
    dateTo: '',
    dateType: 'receiptDate' as 'receiptDate' | 'createdAt',
  });

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const dateToCheck = filters.dateType === 'receiptDate' 
        ? receipt.dateReceipt 
        : receipt.createdAt;

      const matchesDateRange = (!filters.dateFrom || new Date(dateToCheck) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(dateToCheck) <= new Date(filters.dateTo));

      const matchesCollector = filters.debtCollectors.length === 0 ||
        filters.debtCollectors.includes(receipt.debtCollectorName);

      return matchesDateRange && matchesCollector;
    });
  }, [receipts, filters]);

  const collectorStats = useMemo(() => {
    const stats = new Map<string, {
      name: string;
      collectedAmount: number;
      totalReceipts: number;
      reconciledReceipts: number;
    }>();

    filteredReceipts.forEach(receipt => {
      const collector = receipt.debtCollectorName;
      if (!collector) return;

      const current = stats.get(collector) || {
        name: collector,
        collectedAmount: 0,
        totalReceipts: 0,
        reconciledReceipts: 0,
      };

      current.totalReceipts++;
      if (receipt.status === 'Reconciled') {
        current.collectedAmount += receipt.receiptAmount;
        current.reconciledReceipts++;
      }

      stats.set(collector, current);
    });

    return Array.from(stats.values()).map(stat => ({
      ...stat,
      successRate: (stat.reconciledReceipts / stat.totalReceipts) * 100,
    }));
  }, [filteredReceipts]);

  const totalStats = useMemo(() => {
    return collectorStats.reduce((acc, curr) => ({
      collectedAmount: acc.collectedAmount + curr.collectedAmount,
      totalReceipts: acc.totalReceipts + curr.totalReceipts,
      reconciledReceipts: acc.reconciledReceipts + curr.reconciledReceipts,
    }), {
      collectedAmount: 0,
      totalReceipts: 0,
      reconciledReceipts: 0,
    });
  }, [collectorStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Debt Collector Performance
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filters.dateType === 'receiptDate' ? 'By Receipt Date' : 'By Created Date'})
          </span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 text-sm font-medium ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('daily')}
              className={`px-4 py-2 text-sm font-medium ${
                activeView === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Daily Report
            </button>
          </div>
          {activeView === 'daily' && (
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={16} />
            Filters
            {(filters.debtCollectors.length > 0 || filters.dateFrom || filters.dateTo) && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {activeView === 'overview' ? (
        <>
          {/* Company Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-blue-600">
                <DollarSign className="h-5 w-5" />
                <h3 className="font-medium">Total Collections</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalStats.collectedAmount)}
              </p>
              <p className="text-sm text-gray-500">
                From {totalStats.reconciledReceipts} reconciled receipts
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-medium">Success Rate</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {((totalStats.reconciledReceipts / totalStats.totalReceipts) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">
                {totalStats.reconciledReceipts} of {totalStats.totalReceipts} receipts
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-purple-600">
                <Users className="h-5 w-5" />
                <h3 className="font-medium">Active Collectors</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {collectorStats.length}
              </p>
              <p className="text-sm text-gray-500">
                With collections in period
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-yellow-600">
                <Target className="h-5 w-5" />
                <h3 className="font-medium">Average Per Collector</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalStats.collectedAmount / (collectorStats.length || 1))}
              </p>
              <p className="text-sm text-gray-500">
                {(totalStats.totalReceipts / (collectorStats.length || 1)).toFixed(1)} receipts avg.
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard collectors={collectorStats} />

          {/* Company KPI */}
          <CompanyKPI currentAmount={totalStats.collectedAmount} />

          {/* Individual KPIs */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Individual Performance</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {collectorStats.map((collector) => (
                <KPITargets
                  key={collector.name}
                  collectorName={collector.name}
                  currentAmount={collector.collectedAmount}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <DailyReport 
          receipts={filteredReceipts} 
          selectedMonth={selectedMonth}
          dateType={filters.dateType} 
        />
      )}

      <KPIFilters
        filters={filters}
        setFilters={setFilters}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
};
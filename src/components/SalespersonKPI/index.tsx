import React, { useMemo, useState } from 'react';
import { Invoice } from '../../types/invoice';
import { format } from 'date-fns';
import { TrendingUp, Users, Package, DollarSign, Target, BarChart3, Filter, Calendar } from 'lucide-react';
import { KPITargets } from './KPITargets';
import { CompanyKPI } from './CompanyKPI';
import { KPIFilters } from './KPIFilters';
import { Leaderboard } from './Leaderboard';
import { DailyReport } from './DailyReport';

interface SalespersonKPIProps {
  invoices: Invoice[];
}

export const SalespersonKPI: React.FC<SalespersonKPIProps> = ({ invoices }) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeView, setActiveView] = useState<'overview' | 'daily'>('overview');
  const [filters, setFilters] = useState({
    salespeople: [] as string[],
    dateRange: 'monthly',
    dateFrom: '',
    dateTo: '',
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesDateRange = (!filters.dateFrom || new Date(invoice.dateInvoice) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(invoice.dateInvoice) <= new Date(filters.dateTo));

      const matchesSalesperson = filters.salespeople.length === 0 ||
        filters.salespeople.includes(invoice.salesperson);

      return matchesDateRange && matchesSalesperson;
    });
  }, [invoices, filters]);

  const salespersonStats = useMemo(() => {
    const stats = new Map<string, {
      name: string;
      totalAmount: number;
      totalBoxes: number;
      totalBalance: number;
      totalInvoices: number;
    }>();

    filteredInvoices.forEach(invoice => {
      const salesperson = invoice.salesperson;
      if (!salesperson) return;

      const current = stats.get(salesperson) || {
        name: salesperson,
        totalAmount: 0,
        totalBoxes: 0,
        totalBalance: 0,
        totalInvoices: 0,
      };

      current.totalAmount += invoice.amountDue;
      current.totalBoxes += invoice.totalBoxes;
      current.totalBalance += invoice.amountDue;
      current.totalInvoices++;

      stats.set(salesperson, current);
    });

    return Array.from(stats.values());
  }, [filteredInvoices]);

  const totalStats = useMemo(() => {
    return salespersonStats.reduce((acc, curr) => ({
      totalAmount: acc.totalAmount + curr.totalAmount,
      totalBoxes: acc.totalBoxes + curr.totalBoxes,
      totalBalance: acc.totalBalance + curr.totalBalance,
      totalInvoices: acc.totalInvoices + curr.totalInvoices,
    }), {
      totalAmount: 0,
      totalBoxes: 0,
      totalBalance: 0,
      totalInvoices: 0,
    });
  }, [salespersonStats]);

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
          Salesperson Performance
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
            {(filters.salespeople.length > 0 || filters.dateFrom || filters.dateTo) && (
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
                <h3 className="font-medium">Total Invoice Amount</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalStats.totalAmount)}
              </p>
              <p className="text-sm text-gray-500">
                From {totalStats.totalInvoices} invoices
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-green-600">
                <Package className="h-5 w-5" />
                <h3 className="font-medium">Total Boxes</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalStats.totalBoxes}
              </p>
              <p className="text-sm text-gray-500">
                Average {(totalStats.totalBoxes / totalStats.totalInvoices || 0).toFixed(1)} per invoice
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-purple-600">
                <Users className="h-5 w-5" />
                <h3 className="font-medium">Active Salespeople</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {salespersonStats.length}
              </p>
              <p className="text-sm text-gray-500">
                With sales in period
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 text-yellow-600">
                <Target className="h-5 w-5" />
                <h3 className="font-medium">Average Per Salesperson</h3>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalStats.totalAmount / (salespersonStats.length || 1))}
              </p>
              <p className="text-sm text-gray-500">
                {(totalStats.totalInvoices / (salespersonStats.length || 1)).toFixed(1)} invoices avg.
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard salespeople={salespersonStats} />

          {/* Company KPI */}
          <CompanyKPI currentAmount={totalStats.totalAmount} currentBoxes={totalStats.totalBoxes} />

          {/* Individual KPIs */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Individual Performance</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {salespersonStats.map((salesperson) => (
                <KPITargets
                  key={salesperson.name}
                  salespersonName={salesperson.name}
                  currentAmount={salesperson.totalAmount}
                  currentBoxes={salesperson.totalBoxes}
                  currentBalance={salesperson.totalBalance}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <DailyReport invoices={invoices} selectedMonth={selectedMonth} />
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
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { InvoiceTable } from './components/InvoiceTable';
import { ReconcileReceipt } from './components/ReconcileReceipt';
import { ImportExport } from './components/ImportExport';
import { useInvoiceStore } from './store/useInvoiceStore';
import { useReceiptStore } from './store/useReceiptStore';
import { useSettingsStore } from './store/useSettingsStore';
import { FileSpreadsheet, Plus, Settings, ClipboardCheck, BarChart3, Building2 } from 'lucide-react';
import { Modal } from './components/Modal';
import { AddInvoiceForm } from './components/AddInvoiceForm';
import { AddReceiptForm } from './components/AddReceiptForm';
import { SettingsPage } from './components/settings/SettingsPage';
import { DebtCollectorKPI } from './components/DebtCollectorKPI';
import { SalespersonKPI } from './components/SalespersonKPI';
import { BranchKPI } from './components/BranchKPI';

export default function App() {
  const { invoices, loadInvoices, isLoading: isLoadingInvoices } = useInvoiceStore();
  const { receipts, loadReceipts, isLoading: isLoadingReceipts } = useReceiptStore();
  const { loadSettings, isLoading: isLoadingSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'invoices' | 'reconcile' | 'kpi-debt' | 'kpi-sales' | 'kpi-branch'>('invoices');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadInvoices();
    loadReceipts();
    loadSettings();
  }, [loadInvoices, loadReceipts, loadSettings]);

  if (isLoadingInvoices || isLoadingReceipts || isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
            </div>
            <SettingsPage />
          </div>
        </div>
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'invoices':
        return <InvoiceTable data={invoices} />;
      case 'reconcile':
        return <ReconcileReceipt data={receipts} />;
      case 'kpi-debt':
        return <DebtCollectorKPI receipts={receipts} invoices={invoices} />;
      case 'kpi-sales':
        return <SalespersonKPI invoices={invoices} />;
      case 'kpi-branch':
        return <BranchKPI invoices={invoices} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              CRM Management System
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Settings size={20} />
              Settings
            </button>
            {!activeTab.startsWith('kpi') && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add {activeTab === 'invoices' ? 'Invoice' : 'Receipt'}
              </button>
            )}
            {activeTab === 'invoices' && <ImportExport />}
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <FileSpreadsheet size={20} />
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('reconcile')}
                className={`${
                  activeTab === 'reconcile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <ClipboardCheck size={20} />
                Reconcile
              </button>
              <button
                onClick={() => setActiveTab('kpi-debt')}
                className={`${
                  activeTab === 'kpi-debt'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <BarChart3 size={20} />
                Debt Collector KPI
              </button>
              <button
                onClick={() => setActiveTab('kpi-sales')}
                className={`${
                  activeTab === 'kpi-sales'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <BarChart3 size={20} />
                Salesperson KPI
              </button>
              <button
                onClick={() => setActiveTab('kpi-branch')}
                className={`${
                  activeTab === 'kpi-branch'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Building2 size={20} />
                Branch KPI
              </button>
            </nav>
          </div>
        </div>

        {renderContent()}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${activeTab === 'invoices' ? 'Invoice' : 'Receipt'}`}
      >
        {activeTab === 'invoices' ? (
          <AddInvoiceForm onClose={() => setIsAddModalOpen(false)} />
        ) : (
          <AddReceiptForm onClose={() => setIsAddModalOpen(false)} />
        )}
      </Modal>
    </div>
  );
}
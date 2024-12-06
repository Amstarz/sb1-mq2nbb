import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { KPITarget } from '../../types/settings';
import { Target, Plus, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface KPITargetsProps {
  collectorName: string;
  currentAmount: number;
}

export const KPITargets: React.FC<KPITargetsProps> = ({ collectorName, currentAmount }) => {
  const { settings, updateKPITarget } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [targets, setTargets] = useState({
    dailyTarget: 0,
    weeklyTarget: 0,
    monthlyTarget: 0,
  });

  const currentTarget = settings.kpiTargets.find(t => 
    t.type === 'individual' && t.debtCollectorName === collectorName
  );

  const handleSave = async () => {
    try {
      const newTarget: KPITarget = {
        id: currentTarget?.id || crypto.randomUUID(),
        type: 'individual',
        debtCollectorName: collectorName,
        ...targets,
        createdAt: currentTarget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateKPITarget(newTarget);
      setIsEditing(false);
      toast.success('KPI targets updated successfully');
    } catch (error) {
      toast.error('Failed to update KPI targets');
    }
  };

  const calculateProgress = (target: number) => {
    if (target === 0) return 0;
    return Math.min((currentAmount / target) * 100, 100);
  };

  const renderProgressBar = (label: string, target: number) => {
    const progress = calculateProgress(target);
    const remaining = Math.max(target - currentAmount, 0);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">
            {remaining > 0 ? `MYR ${remaining.toFixed(2)} to go` : 'Target achieved!'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Current: MYR {currentAmount.toFixed(2)}</span>
          <span>Target: MYR {target.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Set Individual KPI Targets for {collectorName}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:text-green-700"
              title="Save"
            >
              <Save size={20} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-red-600 hover:text-red-700"
              title="Cancel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Target (MYR)</label>
            <input
              type="number"
              value={targets.dailyTarget}
              onChange={(e) => setTargets(prev => ({ ...prev, dailyTarget: parseFloat(e.target.value) || 0 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Weekly Target (MYR)</label>
            <input
              type="number"
              value={targets.weeklyTarget}
              onChange={(e) => setTargets(prev => ({ ...prev, weeklyTarget: parseFloat(e.target.value) || 0 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Target (MYR)</label>
            <input
              type="number"
              value={targets.monthlyTarget}
              onChange={(e) => setTargets(prev => ({ ...prev, monthlyTarget: parseFloat(e.target.value) || 0 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {collectorName}'s KPI Progress
        </h3>
        <button
          onClick={() => {
            setTargets({
              dailyTarget: currentTarget?.dailyTarget || 0,
              weeklyTarget: currentTarget?.weeklyTarget || 0,
              monthlyTarget: currentTarget?.monthlyTarget || 0,
            });
            setIsEditing(true);
          }}
          className="p-2 text-blue-600 hover:text-blue-700"
          title="Edit Targets"
        >
          {currentTarget ? <Edit2 size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="space-y-6">
        {currentTarget ? (
          <>
            {renderProgressBar('Daily Target', currentTarget.dailyTarget)}
            {renderProgressBar('Weekly Target', currentTarget.weeklyTarget)}
            {renderProgressBar('Monthly Target', currentTarget.monthlyTarget)}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No targets set. Click the plus icon to set targets.
          </div>
        )}
      </div>
    </div>
  );
};
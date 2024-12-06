import React from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface LeaderboardEntry {
  name: string;
  collectedAmount: number;
  totalReceipts: number;
  successRate: number;
}

interface LeaderboardProps {
  collectors: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ collectors }) => {
  const { settings } = useSettingsStore();
  const sortedCollectors = [...collectors].sort((a, b) => b.collectedAmount - a.collectedAmount);
  const topCollectors = sortedCollectors.slice(0, 10); // Show top 10

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-500'; // Gold
      case 1:
        return 'text-gray-400'; // Silver
      case 2:
        return 'text-amber-600'; // Bronze
      default:
        return 'text-gray-300';
    }
  };

  const getCollectorProfile = (name: string) => {
    return settings.debtCollectors.find(c => c.value === name);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
      </div>

      <div className="space-y-4">
        {topCollectors.map((collector, index) => {
          const profile = getCollectorProfile(collector.name);
          return (
            <div
              key={collector.name}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index < 3 ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full overflow-hidden ${
                    profile?.imageUrl ? 'bg-white' : 'bg-gray-200'
                  }`}>
                    {profile?.imageUrl ? (
                      <img 
                        src={profile.imageUrl} 
                        alt={collector.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-medium">
                        {collector.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                    index < 3 ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    {index < 3 ? (
                      <Medal className={`w-4 h-4 ${getMedalColor(index)}`} />
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{collector.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{collector.totalReceipts} receipts</span>
                    <span>•</span>
                    <span>{collector.successRate.toFixed(1)}% success rate</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatCurrency(collector.collectedAmount)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Collected</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
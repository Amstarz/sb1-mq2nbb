import React from 'react';
import { Trophy, TrendingUp, Medal, Package } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface LeaderboardEntry {
  name: string;
  totalAmount: number;
  totalBoxes: number;
  totalInvoices: number;
}

interface LeaderboardProps {
  salespeople: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ salespeople }) => {
  const { settings } = useSettingsStore();
  const sortedSalespeople = [...salespeople].sort((a, b) => b.totalAmount - a.totalAmount);
  const topSalespeople = sortedSalespeople.slice(0, 10); // Show top 10

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

  const getSalespersonProfile = (name: string) => {
    return settings.salespeople.find(s => s.value === name);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
      </div>

      <div className="space-y-4">
        {topSalespeople.map((person, index) => {
          const profile = getSalespersonProfile(person.name);
          return (
            <div
              key={person.name}
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
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-medium">
                        {person.name.charAt(0)}
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
                  <h4 className="font-medium text-gray-900">{person.name}</h4>
                  <div className="flex flex-col gap-1">
                    {profile?.branch && (
                      <span className="text-sm text-blue-600">
                        {profile.branch}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{person.totalInvoices} invoices</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{person.totalBoxes} boxes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatCurrency(person.totalAmount)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total Sales</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};